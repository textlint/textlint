import type { TxtDocumentNode } from "@textlint/ast-node-types";
import { ASTNodeTypes } from "@textlint/ast-node-types";
import { parseMarkdown } from "./parser.js";

export { ASTNodeTypes as Syntax };

/**
 * Options of `parse`.
 * Each option enables an extension that changes how a syntax is recognized.
 */
export type ParseOptions = {
    /**
     * Recognize emphasis, strong emphasis, and strikethrough next to CJK punctuation,
     * as the CommonMark CJK-friendly Amendments define.
     * https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md
     * @default false
     */
    cjkFriendlyEmphasis?: boolean;
};

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
    return parseMarkdown(hasBOM ? text.slice(1) : text, options?.cjkFriendlyEmphasis === true);
}
