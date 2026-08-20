import { unified, type Processor } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import frontmatter from "remark-frontmatter";
import footnotes from "remark-footnotes";
import type { Node } from "unist";

// FIXME: Disable auto link literal transforms that break AST node
// https://github.com/remarkjs/remark-gfm/issues/16
const disableGfmAutolinkLiteralTransforms = function (this: Processor): void {
    const gfmExtensions = this.data().fromMarkdownExtensions?.at(-1);
    if (Array.isArray(gfmExtensions) && gfmExtensions[0]) {
        gfmExtensions[0].transforms = [];
    }
};

const remark = unified()
    .use(remarkParse)
    .use(frontmatter, [
        "yaml",
        "toml",
        // Hexo style
        { type: "json", fence: { open: ";;;", close: ";;;" } },
        // 11ty style
        { type: "json", fence: { open: "---json", close: "---" } },
        // Hugo style
        { type: "json", fence: { open: "{", close: "}" } }
    ])
    .use(remarkGfm)
    .use(disableGfmAutolinkLiteralTransforms)
    .use(footnotes, {
        inlineNotes: true
    });

export const parseMarkdown = (text: string): Node => {
    return remark.parse(text);
};
