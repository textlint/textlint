"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var textlint_engine_core_1 = require("./engine/textlint-engine-core");
var textfix_formatter_1 = require("./fixer/textfix-formatter");
/**
 * TextFixEngine a adapter for TextLintEngineCore.
 * It aim to pull the whole look together. (TextLintEngine and TextFixEngine)
 */
var TextFixEngine = /** @class */ (function () {
    /**
     * TextFixEngine is a adaptor of TextLintEngineCore.
     * @param {Config|Object} [config]
     * @returns {TextLintEngineCore}
     */
    function TextFixEngine(config) {
        var executor = {
            /**
             * @param {TextLintCore} textlintCore
             * @returns {function()}
             */
            onFile: function (textlintCore) {
                /**
                 * Fixes the current configuration on an array of file and directory names.
                 * TextFixEngine#executeOnFiles
                 * @returns {TextlintFixResult[]} The results for all files that were linted.
                 */
                return function (file) {
                    return textlintCore.fixFile(file);
                };
            },
            /**
             * @param {TextLintCore} textlintCore
             * @returns {function()}
             */
            onText: function (textlintCore) {
                /**
                 * Fix texts with ext option.
                 * TextFixEngine#executeOnText
                 * @param {string} text linting text content
                 * @param {string} ext ext is a type for linting. default: ".txt"
                 * @returns {TextlintFixResult[]}
                 */
                return function (text, ext) {
                    return textlintCore.fixText(text, ext);
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
                return textfix_formatter_1.createFormatter(formatterConfig);
            }
        };
        return new textlint_engine_core_1.TextLintEngineCore(config, executor);
    }
    return TextFixEngine;
}());
exports.TextFixEngine = TextFixEngine;
