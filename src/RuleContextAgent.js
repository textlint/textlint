const EventEmitter = require('events').EventEmitter;
const UnionSyntax = require("./parser/union-syntax");
const debug = require('debug')('textlint:RuleContextAgent');
/**
 * The Agent communicate between RuleContext and Rules.
 */
export default class RuleContextAgent extends EventEmitter {

    constructor(text) {
        super();
        // set unlimited listeners (see https://github.com/textlint/textlint/issues/33)
        this.setMaxListeners(0);
        this.messages = [];
        this.currentText = text || "";
    }

    resetState(text = "") {
        this.currentText = text;
        this.messages = [];
    }

    /**
     * push new RuleError to results
     * @param {string} ruleId
     * @param {TxtNode} node
     * @param {number} severity
     * @param {RuleError} error
     */
    pushReport({ruleId, node, severity, error}) {
        debug('pushReport %s', error);
        var lineNumber = error.line ? node.loc.start.line + error.line : node.loc.start.line;
        var columnNumber = error.column ? node.loc.start.column + error.column : node.loc.start.column;
        // add TextLintMessage
        var message = {
            ruleId: ruleId,
            message: error.message,
            // See https://github.com/textlint/textlint/blob/master/typing/textlint.d.ts
            line: lineNumber,        // start with 1(1-based line number)
            column: columnNumber + 1,// start with 1(1-based column number)
            severity: severity // it's for compatible ESLint formatter
        };
        this.messages.push(message);
    }

    // TODO: allow to use Syntax which is defined by Plugin Processor.
    getSyntax() {
        return UnionSyntax;
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
