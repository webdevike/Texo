import { createHash, randomUUID } from 'node:crypto';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { IncomingMessage } from 'node:http';
import type { Plugin } from 'vite';
import {
  validateCanvasDocument,
  type CanvasDocument,
} from '../src/app/canvas-document';

const endpoint = '/__texo/canvas';
const virtualId = 'virtual:texo-canvas-runtime';
const resolvedVirtualId = `\0${virtualId}`;
const maxBytes = 1_000_000;
const revisionOf = (raw: string) =>
  createHash('sha256').update(raw).digest('hex');
const conflictMessage =
  'project/canvas.json changed elsewhere. Reload before saving; your local canvas has been retained.';

class FileError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function readDocument(path: string) {
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch (error) {
    throw new FileError(
      500,
      `Cannot read project/canvas.json. Restore the file or check its permissions. ${error instanceof Error ? error.message : ''}`,
    );
  }
  try {
    if (Buffer.byteLength(raw) > maxBytes)
      throw new Error('File exceeds the 1 MB limit.');
    const document: unknown = JSON.parse(raw);
    validateCanvasDocument(document);
    return { raw, document, revision: revisionOf(raw) };
  } catch (error) {
    throw new FileError(
      422,
      `project/canvas.json is invalid and has been preserved. Fix it on disk before loading or saving. ${error instanceof Error ? error.message : ''}`,
    );
  }
}

async function readUpdate(
  req: IncomingMessage,
): Promise<{ document: CanvasDocument; revision: string }> {
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
    validateCanvasDocument(update.document);
  } catch (error) {
    throw new FileError(
      400,
      error instanceof Error ? error.message : 'Invalid canvas document.',
    );
  }
  return { document: update.document, revision: update.revision };
}

export function canvasFiles(): Plugin {
  let path: string;
  let writes: Promise<unknown> = Promise.resolve();
  return {
    name: 'texo-canvas-files',
    configResolved(config) {
      path = resolve(config.root, 'project/canvas.json');
    },
    resolveId(id) {
      return id === virtualId ? resolvedVirtualId : undefined;
    },
    async load(id) {
      if (id !== resolvedVirtualId) return;
      const { document } = await readDocument(path);
      this.addWatchFile(path);
      return `export const instances = JSON.parse(${JSON.stringify(JSON.stringify(document.instances))});\nexport default instances;\n`;
    },
    handleHotUpdate(context) {
      // The editor polls this document without discarding unsaved React state.
      if (context.file === path) return [];
    },
    configureServer(server) {
      server.middlewares.use(endpoint, async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        const reply = (status: number, data: unknown) => {
          res.statusCode = status;
          res.end(JSON.stringify(data));
        };
        try {
          if (req.url?.split('?')[0] !== '/' && req.url?.split('?')[0] !== '') {
            return reply(404, { error: 'Unknown canvas endpoint.' });
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
              error:
                'Only the same-origin local editor can access project/canvas.json.',
            });
          }
          if (req.method === 'GET') {
            const { document, revision } = await readDocument(path);
            return reply(200, { document, revision });
          }
          if (req.headers['x-texo-editor'] !== '1')
            return reply(403, { error: 'Only the local editor can save.' });
          if (
            req.headers['content-type']?.split(';')[0].trim() !==
            'application/json'
          ) {
            return reply(415, { error: 'Send application/json.' });
          }
          const update = await readUpdate(req);
          const save = writes.then(async () => {
            const current = await readDocument(path);
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
                : 'Could not read or save project/canvas.json. Check file permissions.',
          });
        }
      });
    },
  };
}
