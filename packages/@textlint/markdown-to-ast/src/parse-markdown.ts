import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { frontmatter } from "micromark-extension-frontmatter";
import type { Node } from "unist";

const frontmatterOptions = [
    "yaml",
    "toml",
    // Hexo style
    { type: "json", fence: { open: ";;;", close: ";;;" } },
    // 11ty style
    { type: "json", fence: { open: "---json", close: "---" } },
    // Hugo style
    { type: "json", fence: { open: "{", close: "}" } }
] as const;

const gfmMdastExtensions = gfmFromMarkdown();
// FIXME: Disable auto link literal transforms that break AST node
// https://github.com/remarkjs/remark-gfm/issues/16
if (gfmMdastExtensions[0]) {
    gfmMdastExtensions[0].transforms = [];
}

const micromarkExtensions = [frontmatter([...frontmatterOptions]), gfm()];
const mdastExtensions = [frontmatterFromMarkdown([...frontmatterOptions]), gfmMdastExtensions];

export const parseMarkdown = (text: string): Node => {
    return fromMarkdown(text, {
        extensions: micromarkExtensions,
        mdastExtensions
    });
};
