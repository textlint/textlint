import { SyntaxMap } from "./mapping/markdown-syntax-map";
import { ASTNodeTypes, TxtNode } from "@textlint/ast-node-types";
import traverse from "traverse";
import debug0 from "debug";
import { parseMarkdown } from "./parse-markdown";

const debug = debug0("@textlint/markdown-to-ast");

export { ASTNodeTypes as Syntax };

/**
 * parse markdown text and return ast mapped location info.
 * @param {string} text
 * @returns {TxtNode}
 */
export function parse<T extends TxtNode>(text: string): T {
    // remark-parse's AST does not consider BOM
    // AST's position does not +1 by BOM
    // So, just trim BOM and parse it for `raw` property
    // textlint's SourceCode also take same approach - trim BOM and check the position
    // This means that the loading side need to consider BOM position - for example fs.readFile and text slice script.
    // https://github.com/micromark/micromark/blob/0f19c1ac25964872a160d8b536878b125ddfe393/lib/preprocess.mjs#L29-L31
    const hasBOM = text.charCodeAt(0) === 0xfeff;
    const textWithoutBOM = hasBOM ? text.slice(1) : text;
    const ast = parseMarkdown(textWithoutBOM);
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
                node.raw = textWithoutBOM.slice(range[0], range[1]);
                // Compatible for https://github.com/syntax-tree/unist, but it is hidden
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
