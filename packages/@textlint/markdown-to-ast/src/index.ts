import { SyntaxMap } from "./mapping/markdown-syntax-map";
import { ASTNodeTypes, TxtNode } from "@textlint/ast-node-types";
import traverse from "traverse";
import debug0 from "debug";
import unified from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import frontmatter from "remark-frontmatter";
import footnotes from "remark-footnotes";

const debug = debug0("@textlint/markdown-to-ast");
const remark = unified().use(remarkParse).use(frontmatter, ["yaml"]).use(remarkGfm).use(footnotes, {
    inlineNotes: true
});

export { ASTNodeTypes as Syntax };

/**
 * parse markdown text and return ast mapped location info.
 * @param {string} text
 * @returns {TxtNode}
 */
export function parse<T extends TxtNode>(text: string): T {
    const ast = remark.parse(text);
    traverse(ast).forEach(function (node: TxtNode) {
        // eslint-disable-next-line no-invalid-this
        if (this.notLeaf) {
            if (node.type) {
                const replacedType = SyntaxMap[node.type as keyof typeof SyntaxMap];
                if (!replacedType) {
                    debug(`replacedType : ${replacedType} , node.type: ${node.type}`);
                } else {
                    node.type = replacedType;
                }
            }
            // map `range`, `loc` and `raw` to node
            if (node.position) {
                const position = node.position;
                const positionCompensated = {
                    start: { line: position.start.line, column: Math.max(position.start.column - 1, 0) },
                    end: { line: position.end.line, column: Math.max(position.end.column - 1, 0) }
                };
                const range = [position.start.offset, position.end.offset] as [number, number];
                node.loc = positionCompensated;
                node.range = range;
                node.raw = text.slice(range[0], range[1]);
                // Compatible for https://github.com/wooorm/unist, but hidden
                Object.defineProperty(node, "position", {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: position
                });
            }
        }
    });
    return ast as T;
}
