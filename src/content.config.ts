import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { NOTES_GLOB_PATTERN } from './lib/note-config';

const optionalDate = z.coerce.date().optional().catch(undefined);
const optionalText = z.coerce.string().optional().catch(undefined);

const notes = defineCollection({
  loader: glob({
    base: './docs',
    // ドットで始まるフォルダ（.claude など）と、_ で始まるトップフォルダ（_解説HTML）は除外
    pattern: [...NOTES_GLOB_PATTERN],
    // 元のパスをそのまま id にする（既定の slug 化だとウィキリンクと一致しなくなる）
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.md$/i, ''),
  }),
  schema: z.looseObject({
    title: optionalText,
    description: optionalText,
    source: optionalText,
    author: z.union([z.string(), z.array(z.string())]).optional().catch(undefined),
    tags: z
      .union([z.string(), z.array(z.coerce.string())])
      .nullish()
      .transform((v) => (v == null ? [] : Array.isArray(v) ? v : v.split(/[,\s]+/).filter(Boolean)))
      .catch([]),
    created: optionalDate,
    published: optionalDate,
    updated: optionalDate,
  }),
});

export const collections = { notes };
