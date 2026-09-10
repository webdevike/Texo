/**
 * texo dev [path]   run the workspace against the project at `path`
 *                   (a directory holding texo.json); without a path the
 *                   bundled preview/ app is framed instead.
 *
 * Runs Vite from this repository with TEXO_PROJECT set; everything else reads
 * the project through tools/project-config.ts.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { resolveProjectFile } from './project-config.ts';

const root = resolve(import.meta.dirname, '..');
const [command, target, ...rest] = process.argv.slice(2);

if (command !== 'dev') {
  console.error('usage: texo dev [path-to-project]');
  process.exit(2);
}

const env = { ...process.env };
if (target) {
  const file = resolveProjectFile(target);
  if (!existsSync(file)) {
    console.error(`${file} not found. Add a texo.json ({ "url": "http://localhost:3000" }) to the project first.`);
    process.exit(1);
  }
  env.TEXO_PROJECT = dirname(file);
  console.log(`texo: framing ${env.TEXO_PROJECT}`);
}

const child = spawn(resolve(root, 'node_modules/.bin/vite'), rest, { cwd: root, env, stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
