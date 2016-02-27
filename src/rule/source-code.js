const UnionSyntax = require("../parser/union-syntax");
/**
 * This class represent of source code.
 */
export default class SourceCode {

    constructor(text = "", filePath) {
        // set unlimited listeners (see https://github.com/textlint/textlint/issues/33)
        this.currentText = text;
        this.currentFilePath = filePath;
    }

    // TODO: allow to use Syntax which is defined by Plugin Processor.
    getSyntax() {
        return UnionSyntax;
    }

    getFilePath() {
        return this.currentFilePath;
    }

    /**
     * Gets the source code for the given node.
     * @param {TxtNode=} node The AST node to get the text for.
     * @param {int=} beforeCount The number of characters before the node to retrieve.
     * @param {int=} afterCount The number of characters after the node to retrieve.
     * @returns {string|null} The text representing the AST node.
     */
    getSource(node, beforeCount, afterCount) {
        let currentText = this.currentText;
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
