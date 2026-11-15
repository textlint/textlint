import type { TxtDocumentNode } from "@textlint/ast-node-types";
import { ASTNodeTypes } from "@textlint/ast-node-types";
import { parseMarkdown } from "./parser.js";
import type { ParseOptions } from "./parser.js";

export { ASTNodeTypes as Syntax };
export type { ParseOptions };

/**
 * parse Markdown text and return ast mapped location info.
 * @param {string} text
 * @param {ParseOptions} [options]
 */
export function parse(text: string, options?: ParseOptions): TxtDocumentNode {
    // AST's position does not +1 by BOM
    // So, just trim BOM and parse it for `raw` property
    // textlint's SourceCode also take same approach - trim BOM and check the position
    // This means that the loading side need to consider BOM position - for example fs.readFile and text slice script.
    const hasBOM = text.charCodeAt(0) === 0xfeff;
    return parseMarkdown(hasBOM ? text.slice(1) : text, options);
}
