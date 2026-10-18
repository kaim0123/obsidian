/**
 * Run an npm script command with INCLUDE_GIT_HISTORY=1 (Windows-safe).
 * Usage: node scripts/with-git-history.mjs dev
 *        node scripts/with-git-history.mjs build
 */
import { spawnSync } from 'node:child_process';

process.env.INCLUDE_GIT_HISTORY = '1';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/with-git-history.mjs <astro-args...>');
  process.exit(1);
}

const result = spawnSync('npx', ['astro', ...args], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
