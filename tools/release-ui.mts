/**
 * Publish @texo/ui as a git-installable package.
 *
 * Builds packages/ui, then pushes the built package (dist + package.json +
 * README) to the orphan branch `ui-release` of this repo and tags it
 * `ui-v<version>`. Consumers depend on it with
 *
 *   "@texo/ui": "github:webdevike/Texo#ui-v0.1.0"
 *
 * Usage: node tools/release-ui.mts [--dry-run]
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pkgDir = join(root, 'packages/ui');
const dryRun = process.argv.includes('--dry-run');
const BRANCH = 'ui-release';

function sh(cmd: string, args: string[], cwd = root) {
  return execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();
}

const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
const tag = `ui-v${pkg.version}`;
const remote = sh('git', ['remote', 'get-url', 'origin']);
const sourceSha = sh('git', ['rev-parse', '--short', 'HEAD']);

if (!dryRun && sh('git', ['ls-remote', '--tags', remote, tag])) {
  throw new Error(`${tag} already exists on ${remote}; bump packages/ui/package.json version first`);
}

console.log(`building @texo/ui ${pkg.version} from ${sourceSha}`);
sh(join(root, 'node_modules/.bin/vite'), ['build'], pkgDir);
sh(join(root, 'node_modules/.bin/tsc'), ['-p', 'tsconfig.build.json'], pkgDir);

const work = mkdtempSync(join(tmpdir(), 'texo-ui-release-'));
sh('git', ['init', '-q', '-b', BRANCH], work);
try {
  sh('git', ['fetch', '-q', remote, BRANCH], work);
  sh('git', ['reset', '-q', '--soft', 'FETCH_HEAD'], work);
  sh('git', ['rm', '-rq', '--cached', '.'], work);
} catch {
  console.log(`${BRANCH} does not exist yet; creating it`);
}

cpSync(join(pkgDir, 'dist'), join(work, 'dist'), { recursive: true });
cpSync(join(pkgDir, 'README.md'), join(work, 'README.md'));
const { scripts: _scripts, ...published } = pkg;
writeFileSync(join(work, 'package.json'), JSON.stringify(published, null, 2) + '\n');
writeFileSync(join(work, '.gitignore'), 'node_modules\n');

sh('git', ['add', '-A'], work);
sh('git', ['-c', 'user.name=texo-release', '-c', 'user.email=texo-release@users.noreply.github.com',
  'commit', '-q', '-m', `@texo/ui ${pkg.version}\n\nBuilt from ${sourceSha}.`], work);
sh('git', ['tag', tag], work);

if (dryRun) {
  console.log(`dry run: would push ${BRANCH} and ${tag} to ${remote}; tree left at ${work}`);
} else {
  sh('git', ['push', '-q', remote, `HEAD:refs/heads/${BRANCH}`, `refs/tags/${tag}`], work);
  rmSync(work, { recursive: true, force: true });
  console.log(`pushed ${BRANCH} and ${tag}. Consumers: "@texo/ui": "github:webdevike/Texo#${tag}"`);
}
