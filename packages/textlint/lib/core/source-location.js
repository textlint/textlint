// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _throwLog;

function _load_throwLog() {
    return _throwLog = require("../util/throw-log");
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = require("assert");
var ObjectAssign = require("object-assign");

var SourceLocation = function () {
    /**
     *
     * @param {SourceCode} source
     */
    function SourceLocation(source) {
        _classCallCheck(this, SourceLocation);

        this.source = source;
    }

    /**
     * adjust node's location with error's padding location.
     * @param {ReportMessage} reportedMessage
     * @returns {{line: number, column: number, fix?: FixCommand}}
     */


    _createClass(SourceLocation, [{
        key: "adjust",
        value: function adjust(reportedMessage) {
            var node = reportedMessage.node,
                ruleError = reportedMessage.ruleError,
                ruleId = reportedMessage.ruleId;

            var errorPrefix = "[" + ruleId + "]" || "";
            var padding = ruleError;
            /*
             FIXME: It is old and un-document way
             new RuleError("message", index);
             */
            var _backwardCompatibleIndexValue = void 0;
            if (typeof padding === "number") {
                _backwardCompatibleIndexValue = padding;
                (0, (_throwLog || _load_throwLog()).throwIfTesting)(errorPrefix + " This is un-document way:\nreport(node, new RuleError(\"message\", index);\n\nPlease use { index }: \n\nreport(node, new RuleError(\"message\", {\n    index: paddingLineColumn\n});\n");
            }
            // when running from textlint-tester, assert
            if (padding.line === undefined && padding.column !== undefined) {
                // FIXME: Backward compatible <= textlint.5.5
                (0, (_throwLog || _load_throwLog()).throwIfTesting)(errorPrefix + " Have to use a sets with \"line\" and \"column\".\nSee FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/line-column-or-index.md            \n\nreport(node, new RuleError(\"message\", {\n    line: paddingLineNumber,\n    column: paddingLineColumn\n});\n\nOR use \"index\" property insteadof only \"column\".\n\nreport(node, new RuleError(\"message\", {\n    index: paddingLineColumn\n});\n");
            }

            // Not use {column, line} with {index}
            if ((padding.line !== undefined || padding.column !== undefined) && padding.index !== undefined) {
                // Introduced textlint 5.6
                // https://github.com/textlint/textlint/releases/tag/5.6.0
                // Always throw Error
                throw new Error(errorPrefix + " Have to use {line, column} or index.\n=> use either one of the two\n\nreport(node, new RuleError(\"message\", {\n    line: paddingLineNumber,\n    column: paddingLineColumn\n});\n\nOR use \"index\" property\n\nreport(node, new RuleError(\"message\", {\n    index: paddingIndexValue\n});\n");
            }

            var adjustedLoc = this._adjustLoc(node, padding, _backwardCompatibleIndexValue);
            var adjustedFix = this._adjustFix(node, padding);
            /*
             {
             line,
             column
             fix?
             }
             */
            return ObjectAssign({}, adjustedLoc, adjustedFix);
        }
    }, {
        key: "_adjustLoc",
        value: function _adjustLoc(node, padding, _paddingIndex) {
            var nodeRange = node.range;
            var line = node.loc.start.line;
            var column = node.loc.start.column;

            // when use {index}
            if (padding.index !== undefined || _paddingIndex !== undefined) {
                var startNodeIndex = nodeRange[0];
                var paddingIndex = _paddingIndex || padding.index;
                var position = this.source.indexToPosition(startNodeIndex + paddingIndex);
                return {
                    column: position.column,
                    line: position.line
                };
            }
            // when use {line, column}
            if (padding.line !== undefined && padding.column !== undefined) {
                if (padding.line > 0) {
                    var addedLine = line + padding.line;
                    // when report with padding {line, column}, message.column should be 0 + padding.column.
                    // In other word, padding line > 0 and message.column start with 0.
                    if (padding.column > 0) {
                        return {
                            line: addedLine,
                            column: padding.column
                        };
                    } else {
                        return {
                            line: addedLine,
                            column: column
                        };
                    }
                }
            }
            // when use { line } only
            if (padding.line !== undefined && padding.line > 0) {
                var _addedLine = line + padding.line;
                return {
                    line: _addedLine,
                    column: column
                };
            }
            // when use { column } only
            // FIXME: backward compatible @ un-document
            // Remove next version 6?
            /*
             new RuleError({
             column: index
             });
             */
            if (padding.column !== undefined && padding.column > 0) {
                var addedColumn = column + padding.column;
                return {
                    line: line,
                    column: addedColumn
                };
            }

            return {
                column: column,
                line: line
            };
        }

        /**
         * Adjust `fix` command range
         * if `fix.isAbsolute` is not absolute position, adjust the position from the `node`.
         * @param {TxtNode} node
         * @param {TextLintMessage} paddingMessage
         * @returns {FixCommand|Object}
         * @private
         */

    }, {
        key: "_adjustFix",
        value: function _adjustFix(node, paddingMessage) {
            var nodeRange = node.range;
            // if not found `fix`, return empty object
            if (paddingMessage.fix === undefined) {
                return {};
            }
            assert(_typeof(paddingMessage.fix) === "object", "fix should be FixCommand object");
            // if absolute position return self
            if (paddingMessage.fix.isAbsolute) {
                return {
                    // remove other property that is not related `fix`
                    // the return object will be merged by `Object.assign`
                    fix: {
                        range: paddingMessage.fix.range,
                        text: paddingMessage.fix.text
                    }
                };
            }
            // if relative position return adjusted position
            return {
                // fix(command) is relative from node's range
                fix: {
                    range: [nodeRange[0] + paddingMessage.fix.range[0], nodeRange[0] + paddingMessage.fix.range[1]],
                    text: paddingMessage.fix.text
                }
            };
        }
    }]);

    return SourceLocation;
}();

exports.default = SourceLocation;
//# sourceMappingURL=source-location.js.map