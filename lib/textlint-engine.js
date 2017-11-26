"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createFormatter = require("textlint-formatter");
var textlint_engine_core_1 = require("./engine/textlint-engine-core");
/**
 * TextLintEngine a adapter for TextLintEngineCore.
 * It aim to pull the whole look together. (TextLintEngine and TextFixEngine)
 */
var TextLintEngine = /** @class */ (function () {
    /**
     * TextLintEngine is a adaptor of TextLintEngineCore.
     * @param {Config|Object} [config]
     * @returns {TextLintEngineCore}
     */
    function TextLintEngine(config) {
        var executor = {
            /**
             * @param {TextLintCore} textlintCore
             * @returns {function()}
             */
            onFile: function (textlintCore) {
                /**
                 * Executes the current configuration on an array of file and directory names.
                 * TextLintEngine#executeOnFile
                 * @param {String} file An array of file and directory names.
                 * @returns {TextlintResult[]} The results for all files that were linted.
                 */
                return function executeOnFile(file) {
                    return textlintCore.lintFile(file);
                };
            },
            /**
             * @param {TextLintCore} textlintCore
             * @returns {function()}
             */
            onText: function (textlintCore) {
                /**
                 * lint text, and return TextlintResult[]
                 * TextLintEngine#executeOnText
                 * @param {string} text linting text content
                 * @param {string} ext ext is a type for linting. default: ".txt"
                 * @returns {TextlintResult[]}
                 */
                return function executeOnText(text, ext) {
                    return textlintCore.lintText(text, ext);
                };
            },
            /**
             * @param {TextLintFormatterOption} formatterConfig
             */
            onFormat: function (formatterConfig) {
                // default formatter name: stylish
                if (!formatterConfig.formatterName) {
                    formatterConfig.formatterName = "stylish";
                }
                return createFormatter(formatterConfig);
            }
        };
        return new textlint_engine_core_1.TextLintEngineCore(config, executor);
    }
    return TextLintEngine;
}());
exports.TextLintEngine = TextLintEngine;
