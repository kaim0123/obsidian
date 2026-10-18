// @ts-check
import { defineConfig } from 'astro/config';
import { extractGitHistory } from './scripts/extract-git-history.mjs';

// Always refresh stub or full history before pages resolve.
extractGitHistory({
  enabled: process.env.INCLUDE_GIT_HISTORY === '1',
});

// https://astro.build/config
export default defineConfig({});
