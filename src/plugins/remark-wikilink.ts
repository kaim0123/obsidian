import path from 'node:path';
import type { AstroIntegration } from 'astro';
import { slug } from 'github-slugger';
import type { Link, PhrasingContent, Root, Html, Text } from 'mdast';
import { visit, SKIP } from 'unist-util-visit';
import type { VFile } from 'vfile';
import { resolveWikilink, type OutLink } from '../lib/notes';

// [[target#heading|alias]] を <a> または未作成の <span> に変換する（詳細設計 §4.1）

const WIKILINK = /(!?)\[\[([^\[\]]+?)\]\]/g;
const DOCS_DIR = path.resolve('docs');

/** ファイルごとの未解決リンク数（dev で同じノートを再変換しても二重に数えない） */
const unresolvedByFile = new Map<string, number>();

interface ParsedLink {
  target: string;
  heading: string;
  alias: string | undefined;
}

function parse(inner: string): ParsedLink {
  // 表の中の `\|` も区切りとして扱う
  const unescaped = inner.replace(/\\\|/g, '|');
  const bar = unescaped.indexOf('|');
  const ref = bar === -1 ? unescaped : unescaped.slice(0, bar);
  const alias = bar === -1 ? undefined : unescaped.slice(bar + 1).trim() || undefined;
  const hash = ref.indexOf('#');
  return {
    target: (hash === -1 ? ref : ref.slice(0, hash)).trim(),
    heading: hash === -1 ? '' : ref.slice(hash + 1).trim(),
    alias,
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** docs/ からの相対 id（拡張子なし）。docs/ の外なら null */
function noteIdOf(file: VFile): string | null {
  const abs = file.history[0];
  if (!abs) return null;
  const rel = path.relative(DOCS_DIR, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return rel.replace(/\\/g, '/').replace(/\.md$/i, '');
}

export default function remarkWikilink() {
  return (tree: Root, file: VFile) => {
    const fromId = noteIdOf(file);
    if (fromId === null) return;

    const outLinks: OutLink[] = [];
    const seen = new Set<string>();
    let unresolved = 0;

    try {
      visit(tree, 'text', (node: Text, i, parent) => {
        if (!parent || i === undefined) return;
        const value = node.value;
        WIKILINK.lastIndex = 0;
        if (!WIKILINK.test(value)) return;
        WIKILINK.lastIndex = 0;

        const parts: PhrasingContent[] = [];
        let last = 0;
        for (const m of value.matchAll(WIKILINK)) {
          if (m.index > last) parts.push({ type: 'text', value: value.slice(last, m.index) });
          last = m.index + m[0].length;

          const { target, heading, alias } = parse(m[2]);
          const hashPart = heading ? `#${slug(heading)}` : '';

          // [[#見出し]]：同じページ内の見出しへ
          if (!target) {
            parts.push({ type: 'link', url: hashPart || '#', children: [{ type: 'text', value: alias ?? heading }] });
            continue;
          }

          const label = alias ?? target;
          const ref = resolveWikilink(target, fromId);
          // ![[...]]（埋め込み）も Phase 1 では通常のリンクとして出す
          if (ref) {
            const link: Link = {
              type: 'link',
              url: ref.url + hashPart,
              children: [{ type: 'text', value: label }],
              data: { hProperties: { className: ['wikilink'] } },
            };
            parts.push(link);
          } else {
            unresolved++;
            const html: Html = {
              type: 'html',
              value: `<span class="wikilink wikilink-unresolved" title="未作成のノート">${escapeHtml(label)}</span>`,
            };
            parts.push(html);
          }

          const outLabel = ref ? ref.name : target;
          const key = `${outLabel}\n${ref?.url ?? ''}`;
          if (!seen.has(key)) {
            seen.add(key);
            outLinks.push({ label: outLabel, url: ref?.url ?? null });
          }
        }
        if (last < value.length) parts.push({ type: 'text', value: value.slice(last) });

        parent.children.splice(i, 1, ...(parts as typeof parent.children));
        return [SKIP, i + parts.length];
      });
    } catch (err) {
      console.warn(`[wikilink] ${fromId}: 変換をスキップしました`, err);
      return;
    }

    unresolvedByFile.set(fromId, unresolved);
    const data = (file.data.astro ??= {}) as { frontmatter?: Record<string, unknown> };
    data.frontmatter ??= {};
    data.frontmatter.outLinks = outLinks;
  };
}

/** ビルド終了時に未解決リンクの合計をログに出す */
export function wikilinkReport(): AstroIntegration {
  return {
    name: 'wikilink-report',
    hooks: {
      'astro:build:done': ({ logger }) => {
        const total = [...unresolvedByFile.values()].reduce((a, b) => a + b, 0);
        const files = [...unresolvedByFile.values()].filter((n) => n > 0).length;
        logger.info(
          `未解決リンク ${total} 件（${files} ノート／変換 ${unresolvedByFile.size} ノート。キャッシュ済みのノートは数えない）`,
        );
      },
    },
  };
}
