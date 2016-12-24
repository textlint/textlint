"use strict";
import TextLintEngineCore from "./engine/textlint-engine-core";
import createFormatter from "./fixer/textfix-formatter";
/**
 * TextFixEngine a adapter for TextLintEngineCore.
 * It aim to pull the whole look together. (TextLintEngine and TextFixEngine)
 */
export default class TextFixEngine {
    /**
     * TextFixEngine is a adaptor of TextLintEngineCore.
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
                 * Fixes the current configuration on an array of file and directory names.
                 * TextFixEngine#executeOnFiles
                 * @param {String[]}  files An array of file and directory names.
                 * @returns {TextLintFixResult[]} The results for all files that were linted.
                 */
                return (file) => {
                    return textlintCore.fixFile(file);
                };
            },
            /**
             * @param {TextLintCore} textlintCore
             * @returns {function()}
             */
            onText: (textlintCore) => {
                /**
                 * Fix texts with ext option.
                 * TextFixEngine#executeOnText
                 * @param {string} text linting text content
                 * @param {string} ext ext is a type for linting. default: ".txt"
                 * @returns {TextLintFixResult[]}
                 */
                return (text, ext) => {
                    return textlintCore.fixText(text, ext);
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
