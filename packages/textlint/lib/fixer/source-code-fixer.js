"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sourceCode;

function _load_sourceCode() {
    return _sourceCode = _interopRequireDefault(require("../core/source-code"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = require("debug")("textlint:source-code-fixer");

var BOM = "\uFEFF";

/**
 * Compares items in a messages array by line and column.
 * @param {TextLintMessage} a The first message.
 * @param {TextLintMessage} b The second message.
 * @returns {int} -1 if a comes before b, 1 if a comes after b, 0 if equal.
 * @private
 */
function compareMessagesByLocation(a, b) {
    var lineDiff = a.line - b.line;

    if (lineDiff === 0) {
        return a.column - b.column;
    } else {
        return lineDiff;
    }
}

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}
/**
 * Utility for apply fixes to source code.
 * @constructor
 */

var SourceCodeFixer = function () {
    function SourceCodeFixer() {
        _classCallCheck(this, SourceCodeFixer);
    }

    _createClass(SourceCodeFixer, null, [{
        key: "applyFixes",

        /**
         * Applies the fixes specified by the messages to the given text. Tries to be
         * smart about the fixes and won't apply fixes over the same area in the text.
         * @param {SourceCode} sourceCode The source code to apply the changes to.
         * @param {TextLintMessage[]} messages The array of messages reported by ESLint.
         * @returns {Object} An object containing the fixed text and any unfixed messages.
         */
        value: function applyFixes(sourceCode, messages) {
            debug("Applying fixes");
            var text = sourceCode.text;
            // As as result, show diff
            var remainingMessages = [];
            var applyingMessages = [];
            var cloneMessages = messages.slice();
            var fixes = [];
            var lastFixPos = text.length + 1;
            var prefix = sourceCode.hasBOM ? BOM : "";
            cloneMessages.forEach(function (problem) {
                if (problem && problem.hasOwnProperty("fix")) {
                    fixes.push(problem);
                } else {
                    remainingMessages.push(problem);
                }
            });

            if (fixes.length) {
                var _ret = function () {
                    debug("Found fixes to apply");

                    // sort in reverse order of occurrence
                    fixes.sort(function (a, b) {
                        if (a.fix.range[1] <= b.fix.range[0]) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });

                    // split into array of characters for easier manipulation
                    var chars = text.split("");

                    fixes.forEach(function (problem) {
                        // pickup fix range
                        var fix = problem.fix;
                        var start = fix.range[0];
                        var end = fix.range[1];
                        var insertionText = fix.text;

                        if (end < lastFixPos) {
                            if (start < 0) {
                                // Remove BOM.
                                prefix = "";
                                start = 0;
                            }
                            if (start === 0 && insertionText[0] === BOM) {
                                // Set BOM.
                                prefix = BOM;
                                insertionText = insertionText.slice(1);
                            }

                            var replacedChars = chars.splice(start, end - start, insertionText);
                            lastFixPos = start;
                            var copyOfMessage = clone(problem);
                            copyOfMessage.fix = {
                                range: [start, start + insertionText.length],
                                text: replacedChars.join("")
                            };
                            applyingMessages.push(copyOfMessage);
                        } else {
                            remainingMessages.push(problem);
                        }
                    });

                    return {
                        v: {
                            fixed: true,
                            messages: cloneMessages, // have order
                            applyingMessages: applyingMessages.reverse(), // have order
                            remainingMessages: remainingMessages.sort(compareMessagesByLocation), // have not order
                            output: prefix + chars.join("")
                        }
                    };
                }();

                if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
            } else {
                debug("No fixes to apply");
                return {
                    fixed: false,
                    messages: cloneMessages,
                    applyingMessages: applyingMessages,
                    remainingMessages: remainingMessages,
                    output: prefix + text
                };
            }
        }

        /**
         * Sequentially Applies the fixes specified by the messages to the given text.
         * @param {SourceCode} sourceCode The source code to apply the changes to.
         * @param {TextLintMessage[]} applyingMessages The array of TextLintMessage reported by SourceCodeFixer#applyFixes
         * @returns {string} An object containing the fixed text and any unfixed messages.
         */

    }, {
        key: "sequentiallyApplyFixes",
        value: function sequentiallyApplyFixes(sourceCode, applyingMessages) {
            debug("Restore applied fixes");
            var text = sourceCode.text;
            applyingMessages.forEach(function (message) {
                var newSource = new (_sourceCode || _load_sourceCode()).default({
                    text: text,
                    ast: sourceCode.ast, // it's dummy
                    ext: sourceCode.ext,
                    filePath: sourceCode.filePath
                });
                var result = SourceCodeFixer.applyFixes(newSource, [message]);
                text = result.output;
            });
            return text;
        }
    }]);

    return SourceCodeFixer;
}();

exports.default = SourceCodeFixer;
//# sourceMappingURL=source-code-fixer.js.map