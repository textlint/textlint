import type {
    TextlintSourceCode,
    TextlintSourceCodeArgs,
    TextlintSourceCodeLocation,
    TextlintSourceCodePosition,
    TextlintSourceCodeRange
} from "@textlint/types";
import { AnyTxtNode, ASTNodeTypes } from "@textlint/ast-node-types";
import { SourceLineTable } from "./source-line-table.js";
import { invariant } from "../util/invariant.js";

/**
 * Validates that the given AST has the required information.
 * @param {AnyTxtNode} [ast] The Program node of the AST to check.
 * @throws {Error} If the AST doesn't contain the correct information.
 * @returns {void}
 * @private
 */
function validate(ast: AnyTxtNode) {
    if (!ast.loc) {
        throw new Error("AST is missing location information.");
    }

    if (!ast.range) {
        throw new Error("AST is missing range information");
    }
}

/**
 * This class represent of source code.
 */
export class TextlintSourceCodeImpl implements TextlintSourceCode {
    hasBOM: boolean;
    text: string;
    ast: AnyTxtNode;
    filePath: string | undefined;
    ext: string;

    private _lineTable: SourceLineTable;

    /**
     * @param {string} text
     * @param {Object} ast
     * @param {string} ext
     * @param {string} [filePath]
     */
    constructor({ text = "", ast, ext, filePath }: TextlintSourceCodeArgs) {
        validate(ast);
        invariant(ext || filePath, "should be set either of fileExt or filePath.");
        this.hasBOM = text.charCodeAt(0) === 0xfeff;
        this.text = this.hasBOM ? text.slice(1) : text;
        this._lineTable = new SourceLineTable(this.text);
        this.ast = ast;
        this.filePath = filePath;
        /**
         * fileType .md .txt ...
         * @type {string}
         */
        this.ext = ext;
    }

    /**
     * @returns {ASTNodeTypes}
     */
    getSyntax() {
        return ASTNodeTypes;
    }

    /**
     * get filePath
     * @returns {string|undefined}
     */
    getFilePath() {
        return this.filePath;
    }

    /**
     * Gets the source code for the given node.
     * @param {AnyTxtNode=} node The AST node to get the text for.
     * @param {int=} beforeCount The number of characters before the node to retrieve.
     * @param {int=} afterCount The number of characters after the node to retrieve.
     * @returns {string} The text representing the AST node.
     */
    getSource(node?: AnyTxtNode, beforeCount?: number, afterCount?: number): string {
        const currentText = this.text;
        if (node) {
            const start = Math.max(node.range[0] - (beforeCount || 0), 0);
            const end = node.range[1] + (afterCount || 0);
            return currentText.slice(start, end);
        } else {
            return currentText;
        }
    }

    // Conversion between an index and a position
    // line is 1-based
    // column is 1-based
    /**
     * @param {TextlintSourceCodeLocation} loc - location indicator.
     * @return {[ number, number ]} range.
     */
    locationToRange(loc: TextlintSourceCodeLocation): TextlintSourceCodeRange {
        return this._lineTable.locationToRange(loc);
    }

    /**
     * @param {[ number, number ]} range - pair of indice.
     * @return {TextlintSourceCodeLocation} location.
     */
    rangeToLocation(range: TextlintSourceCodeRange): TextlintSourceCodeLocation {
        return this._lineTable.rangeToLocation(range);
    }

    /**
     * @param pos - position indicator.
     * @return {number} index.
     */
    positionToIndex(pos: TextlintSourceCodePosition): number {
        return this._lineTable.positionToIndex(pos);
    }

    /**
     * @param index - index to the source code.
     */
    indexToPosition(index: number): TextlintSourceCodePosition {
        return this._lineTable.indexToPosition(index);
    }
}
