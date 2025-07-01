import unified from "unified";
// @ts-expect-error - Package lacks TypeScript definitions
import autolinkLiteral from "mdast-util-gfm-autolink-literal/from-markdown";
// FIXME: Disable auto link literal transforms that break AST node
// https://github.com/remarkjs/remark-gfm/issues/16
// Need to override before import gfm plugin
autolinkLiteral.transforms = [];
// Load plugins
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import frontmatter from "remark-frontmatter";
import footnotes from "remark-footnotes";
import type { Node } from "unist";

const remark = unified().use(remarkParse).use(frontmatter, ["yaml"]).use(remarkGfm).use(footnotes, {
    inlineNotes: true
});
export const parseMarkdown = (text: string): Node => {
    return remark.parse(text);
};
