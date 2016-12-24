"use strict";
const createFormatter = require("textlint-formatter");
import TextLintEngineCore from "./engine/textlint-engine-core";
/**
 * TextLintEngine a adapter for TextLintEngineCore.
 * It aim to pull the whole look together. (TextLintEngine and TextFixEngine)
 */
export default class TextLintEngine {
    /**
     * TextLintEngine is a adaptor of TextLintEngineCore.
     * @param {Config|Object} [config]
     * @returns {TextLintEngineCore}
     */
    constructor(config) {
        const executor = {
            /**
             * @param {TextLintCore} textlintCore
             * @returns {function()}
             */
            onFile: (textlintCore) => {
                /**
                 * Executes the current configuration on an array of file and directory names.
                 * TextLintEngine#executeOnFile
                 * @param {String} file An array of file and directory names.
                 * @returns {TextLintResult[]} The results for all files that were linted.
                 */
                return function executeOnFile(file) {
                    return textlintCore.lintFile(file);
                };
            },
            /**
             * @param {TextLintCore} textlintCore
             * @returns {function()}
             */
            onText: (textlintCore) => {
                /**
                 * lint text, and return TextLintResult[]
                 * TextLintEngine#executeOnText
                 * @param {string} text linting text content
                 * @param {string} ext ext is a type for linting. default: ".txt"
                 * @returns {TextLintResult[]}
                 */
                return function executeOnText(text, ext) {
                    return textlintCore.lintText(text, ext);
                };
            },
            /**
             * @param {TextLintFormatterOption} formatterConfig
             */
            onFormat: (formatterConfig) => {
                // default formatter name: stylish
                if (!formatterConfig.formatterName) {
                    formatterConfig.formatterName = "stylish";
                }
                return createFormatter(formatterConfig);
            }
        };
        return new TextLintEngineCore(config, executor);
    }
}
