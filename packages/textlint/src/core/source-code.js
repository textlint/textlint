const assert = require("assert");
const StructuredSource = require("structured-source");
import TextLintNodeType from "../shared/type/TextLintNodeType";
/**
 * Validates that the given AST has the required information.
 * @param {TxtAST.TxtNode} [ast] The Program node of the AST to check.
 * @throws {Error} If the AST doesn't contain the correct information.
 * @returns {void}
 * @private
 */
function validate(ast) {
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
export default class SourceCode {
    constructor({text = "", ast, ext, filePath}) {
        validate(ast);
        assert(ext || filePath, "should be set either of fileExt or filePath.");
        this.hasBOM = text.charCodeAt(0) === 0xFEFF;
        this.text = (this.hasBOM ? text.slice(1) : text);
        /**
         * @type StructuredSource
         */
        this._structuredSource = new StructuredSource(this.text);
        this.ast = ast;
        this.filePath = filePath;
        // fileType .md .txt ...
        this.ext = ext;
    }

    /**
     * @returns {TextLintNodeType}
     */
    getSyntax() {
        return TextLintNodeType;
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
     * @param {TxtNode=} node The AST node to get the text for.
     * @param {int=} beforeCount The number of characters before the node to retrieve.
     * @param {int=} afterCount The number of characters after the node to retrieve.
     * @returns {string|null} The text representing the AST node.
     */
    getSource(node, beforeCount, afterCount) {
        const currentText = this.text;
        if (currentText == null) {
            return null;
        }
        if (node) {
            const start = Math.max(node.range[0] - (beforeCount || 0), 0);
            const end = node.range[1] + (afterCount || 0);
            return currentText.slice(start, end);
        } else {
            return currentText;
        }
    }

    // StructuredSource wrapper
    /**
     * @param {SourceLocation} loc - location indicator.
     * @return {[ number, number ]} range.
     */
    locationToRange(loc) {
        return this._structuredSource.locationToRange(loc);
    }

    /**
     * @param {[ number, number ]} range - pair of indice.
     * @return {SourceLocation} location.
     */
    rangeToLocation(range) {
        return this._structuredSource.rangeToLocation(range);
    }

    /**
     * @param {Position} pos - position indicator.
     * @return {number} index.
     */
    positionToIndex(pos) {
        return this._structuredSource.positionToIndex(pos);
    }

    /**
     * @param {number} index - index to the source code.
     * @return {Position} position.
     */
    indexToPosition(index) {
        return this._structuredSource.indexToPosition(index);
    }
}
