import { createHash, randomUUID } from 'node:crypto';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { IncomingMessage } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';
import { canvasFile } from '../src/app/canvas-document';
import { prototypeFile } from '../src/app/prototype-document';

/**
 * Serves the editable JSON files under project/ to the same-origin dev editor:
 * GET returns `{ document, revision }`, PUT saves `{ document, revision }` only
 * when the revision still matches the file on disk. project/canvas.json also
 * feeds the `virtual:texo-canvas-runtime` module used by production builds.
 */
const virtualId = 'virtual:texo-canvas-runtime';
const resolvedVirtualId = `\0${virtualId}`;
const maxBytes = 1_000_000;
const revisionOf = (raw: string) =>
  createHash('sha256').update(raw).digest('hex');

type ProjectFile = {
  endpoint: string;
  label: string;
  validate: (value: unknown) => void;
};

class FileError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function readDocument(path: string, file: ProjectFile) {
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch (error) {
    throw new FileError(
      500,
      `Cannot read ${file.label}. Restore the file or check its permissions. ${error instanceof Error ? error.message : ''}`,
    );
  }
  try {
    if (Buffer.byteLength(raw) > maxBytes)
      throw new Error('File exceeds the 1 MB limit.');
    const document: unknown = JSON.parse(raw);
    file.validate(document);
    return { raw, document, revision: revisionOf(raw) };
  } catch (error) {
    throw new FileError(
      422,
      `${file.label} is invalid and has been preserved. Fix it on disk before loading or saving. ${error instanceof Error ? error.message : ''}`,
    );
  }
}

async function readUpdate(
  req: IncomingMessage,
  file: ProjectFile,
): Promise<{ document: unknown; revision: string }> {
  if (Number(req.headers['content-length']) > maxBytes) {
    req.resume();
    throw new FileError(413, 'Save exceeds the 1 MB limit.');
  }
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > maxBytes) {
      req.resume();
      throw new FileError(413, 'Save exceeds the 1 MB limit.');
    }
    chunks.push(buffer);
  }
  let update: unknown;
  try {
    update = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new FileError(400, 'Save body must be valid JSON.');
  }
  if (
    !update ||
    typeof update !== 'object' ||
    Array.isArray(update) ||
    !('document' in update) ||
    !('revision' in update) ||
    Object.keys(update).length !== 2 ||
    typeof update.revision !== 'string' ||
    !/^[a-f0-9]{64}$/.test(update.revision)
  ) {
    throw new FileError(
      400,
      'Send exactly a document and its SHA-256 revision from the last load.',
    );
  }
  try {
    file.validate(update.document);
  } catch (error) {
    throw new FileError(
      400,
      error instanceof Error ? error.message : `Invalid ${file.label}.`,
    );
  }
  return { document: update.document, revision: update.revision };
}

function serve(server: ViteDevServer, path: string, file: ProjectFile) {
  const conflictMessage = `${file.label} changed elsewhere. Reload before saving; your local changes have been retained.`;
  let writes: Promise<unknown> = Promise.resolve();
  server.middlewares.use(file.endpoint, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    const reply = (status: number, data: unknown) => {
      res.statusCode = status;
      res.end(JSON.stringify(data));
    };
    try {
      if (req.url?.split('?')[0] !== '/' && req.url?.split('?')[0] !== '') {
        return reply(404, { error: 'Unknown project file endpoint.' });
      }
      if (req.method !== 'GET' && req.method !== 'PUT') {
        res.setHeader('Allow', 'GET, PUT');
        return reply(405, { error: 'Use GET or PUT.' });
      }
      const expectedOrigin = `${server.config.server.https ? 'https' : 'http'}://${req.headers.host}`;
      if (
        (req.headers.origin && req.headers.origin !== expectedOrigin) ||
        (req.headers['sec-fetch-site'] &&
          req.headers['sec-fetch-site'] !== 'same-origin' &&
          req.headers['sec-fetch-site'] !== 'none')
      ) {
        return reply(403, {
          error: `Only the same-origin local editor can access ${file.label}.`,
        });
      }
      if (req.method === 'GET') {
        const { document, revision } = await readDocument(path, file);
        return reply(200, { document, revision });
      }
      if (req.headers['x-texo-editor'] !== '1')
        return reply(403, { error: 'Only the local editor can save.' });
      if (
        req.headers['content-type']?.split(';')[0].trim() !== 'application/json'
      ) {
        return reply(415, { error: 'Send application/json.' });
      }
      const update = await readUpdate(req, file);
      const save = writes.then(async () => {
        const current = await readDocument(path, file);
        if (update.revision !== current.revision)
          throw new FileError(409, conflictMessage);
        const next = JSON.stringify(update.document, null, 2) + '\n';
        if (Buffer.byteLength(next) > maxBytes)
          throw new FileError(
            413,
            'Formatted document exceeds the 1 MB limit.',
          );
        const temporary = `${path}.${randomUUID()}.tmp`;
        try {
          await writeFile(temporary, next, { flag: 'wx' });
          if ((await readFile(path, 'utf8')) !== current.raw)
            throw new FileError(409, conflictMessage);
          await rename(temporary, path);
        } finally {
          await rm(temporary, { force: true }).catch(() => undefined);
        }
        return revisionOf(next);
      });
      writes = save.catch(() => undefined);
      return reply(200, { revision: await save });
    } catch (error) {
      reply(error instanceof FileError ? error.status : 500, {
        error:
          error instanceof Error
            ? error.message
            : `Could not read or save ${file.label}. Check file permissions.`,
      });
    }
  });
}

export function projectFiles(): Plugin {
  let canvasPath: string;
  let prototypePath: string;
  return {
    name: 'texo-project-files',
    configResolved(config) {
      canvasPath = resolve(config.root, canvasFile.label);
      prototypePath = resolve(config.root, prototypeFile.label);
    },
    resolveId(id) {
      return id === virtualId ? resolvedVirtualId : undefined;
    },
    async load(id) {
      if (id !== resolvedVirtualId) return;
      const { document } = await readDocument(canvasPath, canvasFile);
      this.addWatchFile(canvasPath);
      return `export const instances = JSON.parse(${JSON.stringify(JSON.stringify(document.instances))});\nexport default instances;\n`;
    },
    handleHotUpdate(context) {
      // The editor polls these documents without discarding unsaved React state.
      if (context.file === canvasPath || context.file === prototypePath)
        return [];
    },
    configureServer(server) {
      serve(server, canvasPath, canvasFile);
      serve(server, prototypePath, prototypeFile);
    },
  };
}
