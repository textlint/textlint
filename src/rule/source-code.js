const path = require("path");
const UnionSyntax = require("../parser/union-syntax");
const assert = require("assert");
/**
 * Validates that the given AST has the required information.
 * @param {TxtSyntax.TxtNode} ast The Program node of the AST to check.
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
        this.text = text;
        this.ast = ast;
        this.filePath = filePath;
        // fileType .md .txt ...
        this.ext = ext;
    }

    hasBOM() {
        return this.text.charCodeAt(0) === 0xFEFF;
    }

    getSyntax() {
        return UnionSyntax;
    }

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
        let currentText = this.text;
        if (currentText == null) {
            return null;
        }
        if (node) {
            let start = Math.max(node.range[0] - (beforeCount || 0), 0);
            let end = node.range[1] + (afterCount || 0);
            return currentText.slice(start, end);
        } else {
            return currentText;
        }
    }
}
