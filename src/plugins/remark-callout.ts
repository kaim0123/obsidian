import type { Blockquote, BlockContent, DefinitionContent, Paragraph, PhrasingContent, Root } from 'mdast';
import { visit } from 'unist-util-visit';

// > [!type]± タイトル を <div> / <details> の Callout に変換する（詳細設計 §4.3）

const CALLOUT = /^\[!(\w+)\]([+-]?)[ \t]*/;

/** 種類（別名を含む）→ 表示名。未知の種類は種類名をそのまま出す */
const LABELS: Record<string, string> = {
  note: 'メモ',
  abstract: '要約', summary: '要約', tldr: '要約',
  info: '情報',
  tip: 'ヒント', hint: 'ヒント', important: 'ヒント',
  warning: '注意', caution: '注意', attention: '注意',
  danger: '危険', error: '危険',
  example: '例',
};

/** 段落の中身を、最初の改行（ソフト改行・<br>）の前後に分ける */
function splitFirstLine(children: PhrasingContent[]): [PhrasingContent[], PhrasingContent[]] {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.type === 'break') return [children.slice(0, i), children.slice(i + 1)];
    if (child.type === 'text') {
      const nl = child.value.indexOf('\n');
      if (nl === -1) continue;
      const head = child.value.slice(0, nl);
      const tail = child.value.slice(nl + 1);
      return [
        [...children.slice(0, i), ...(head ? [{ ...child, value: head }] : [])],
        [...(tail ? [{ ...child, value: tail }] : []), ...children.slice(i + 1)],
      ];
    }
  }
  return [children, []];
}

export default function remarkCallout() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const first = node.children[0];
      if (first?.type !== 'paragraph') return;
      const lead = first.children[0];
      if (lead?.type !== 'text') return;
      const m = CALLOUT.exec(lead.value);
      if (!m) return;

      const type = m[1].toLowerCase();
      const fold = m[2];
      const rest = lead.value.slice(m[0].length);
      const [titleInline, bodyInline] = splitFirstLine([
        ...(rest ? [{ ...lead, value: rest }] : []),
        ...first.children.slice(1),
      ]);
      const hasTitle = titleInline.some((c) => c.type !== 'text' || c.value.trim() !== '');

      const title: Paragraph = {
        type: 'paragraph',
        children: hasTitle ? titleInline : [{ type: 'text', value: LABELS[type] ?? m[1] }],
        data: { hName: fold ? 'summary' : 'div', hProperties: { className: ['callout-title'] } },
      };

      const bodyChildren: (BlockContent | DefinitionContent)[] = [
        ...(bodyInline.length ? [{ type: 'paragraph', children: bodyInline } as Paragraph] : []),
        ...node.children.slice(1),
      ];
      // 本文の入れ物。blockquote 型にして hName で div に変える（中の入れ子 Callout は visit が続けて処理する）
      const body: Blockquote = {
        type: 'blockquote',
        children: bodyChildren,
        data: { hName: 'div', hProperties: { className: ['callout-body'] } },
      };

      node.children = bodyChildren.length ? [title, body] : [title];
      node.data = {
        hName: fold ? 'details' : 'div',
        hProperties: {
          className: ['callout', `callout-${type}`],
          ...(fold === '+' ? { open: true } : {}),
        },
      };
    });
  };
}
