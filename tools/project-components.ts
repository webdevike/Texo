import { glob } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { searchForWorkspaceRoot, type Plugin } from 'vite';

import { loadProject } from './project-config';

/**
 * `virtual:texo-project-components`: the modules matched by texo.json
 * `components`, so the Custom page shows the framed project's own
 * `defineTexoComponent` definitions next to Texo's. Modules load by absolute
 * path from the project tree; React, Mantine, and @texo/ui are deduped onto
 * the admin's copies so their hooks and context work inside the admin.
 * Without a project (or without `components`) the module exports nothing.
 */
const virtualId = 'virtual:texo-project-components';
const resolvedVirtualId = `\0${virtualId}`;

async function matches(root: string, patterns: string[]) {
  const files: string[] = [];
  for (const pattern of patterns) {
    for await (const file of glob(pattern, { cwd: root })) files.push(resolve(root, file));
  }
  return files.sort();
}

/** Directory a glob starts in (its longest literal prefix). */
function patternDir(root: string, pattern: string) {
  const literal = pattern.split(/[*?[{]/)[0];
  return resolve(root, literal.endsWith('/') ? literal : dirname(literal));
}

export function projectComponents(): Plugin {
  const project = loadProject();
  return {
    name: 'texo-project-components',
    config(config) {
      if (!project?.components.length) return;
      return {
        resolve: {
          dedupe: ['react', 'react-dom', '@mantine/core', '@mantine/hooks', '@mantine/code-highlight', '@texo/ui'],
        },
        server: {
          fs: { allow: [searchForWorkspaceRoot(config.root ?? process.cwd()), project.root] },
        },
      };
    },
    resolveId(id) {
      return id === virtualId ? resolvedVirtualId : undefined;
    },
    async load(id) {
      if (id !== resolvedVirtualId) return;
      const files = project?.components.length ? await matches(project.root, project.components) : [];
      const imports = files.map((file, index) => `import * as m${index} from ${JSON.stringify(file)};`);
      const entries = files.map((file, index) => `  { path: ${JSON.stringify(relative(project!.root, file))}, module: m${index} },`);
      return `${imports.join('\n')}\nexport const modules = [\n${entries.join('\n')}\n];\n`;
    },
    configureServer(dev) {
      if (!project?.components.length) return;
      // New or removed component files change the module list, not a module.
      const dirs = project.components.map((pattern) => patternDir(project.root, pattern));
      dev.watcher.add(dirs);
      const refresh = (file: string) => {
        if (!dirs.some((dir) => file.startsWith(dir))) return;
        const module = dev.moduleGraph.getModuleById(resolvedVirtualId);
        if (module) {
          dev.moduleGraph.invalidateModule(module);
          dev.ws.send({ type: 'full-reload' });
        }
      };
      dev.watcher.on('add', refresh);
      dev.watcher.on('unlink', refresh);
    },
  };
}
