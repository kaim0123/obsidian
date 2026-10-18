// @ts-check
import { defineConfig } from 'astro/config';
import { extractGitHistory } from './scripts/extract-git-history.mjs';
import explainerNav from './src/integrations/explainer-nav.ts';
import remarkWikilink, { wikilinkReport } from './src/plugins/remark-wikilink.ts';

// Always refresh stub or full history before pages resolve.
extractGitHistory({
  enabled: process.env.INCLUDE_GIT_HISTORY === '1',
});

// https://astro.build/config
export default defineConfig({
  integrations: [explainerNav(), wikilinkReport()],
  markdown: {
    shikiConfig: { theme: 'github-dark-default' },
    remarkPlugins: [remarkWikilink],
  },
});
