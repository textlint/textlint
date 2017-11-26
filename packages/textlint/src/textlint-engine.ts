"use strict";
const createFormatter = require("textlint-formatter");
import { TextLintEngineCore } from "./engine/textlint-engine-core";
import { Config } from "./config/config";
import { TextLintCore } from "./textlint-core";
import { TextLintFormatterOption } from "./textlint-interface";
/**
 * TextLintEngine a adapter for TextLintEngineCore.
 * It aim to pull the whole look together. (TextLintEngine and TextFixEngine)
 */
export class TextLintEngine {
    /**
     * TextLintEngine is a adaptor of TextLintEngineCore.
     * @param {Config|Object} [config]
     * @returns {TextLintEngineCore}
     */
    constructor(config: Partial<Config>) {
        const executor = {
            /**
             * @param {TextLintCore} textlintCore
             * @returns {function()}
             */
            onFile: (textlintCore: TextLintCore) => {
                /**
                 * Executes the current configuration on an array of file and directory names.
                 * TextLintEngine#executeOnFile
                 * @param {String} file An array of file and directory names.
                 * @returns {TextlintResult[]} The results for all files that were linted.
                 */
                return function executeOnFile(file: string) {
                    return textlintCore.lintFile(file);
                };
            },
            /**
             * @param {TextLintCore} textlintCore
             * @returns {function()}
             */
            onText: (textlintCore: TextLintCore) => {
                /**
                 * lint text, and return TextlintResult[]
                 * TextLintEngine#executeOnText
                 * @param {string} text linting text content
                 * @param {string} ext ext is a type for linting. default: ".txt"
                 * @returns {TextlintResult[]}
                 */
                return function executeOnText(text: string, ext: string | undefined) {
                    return textlintCore.lintText(text, ext);
                };
            },
            /**
             * @param {TextLintFormatterOption} formatterConfig
             */
            onFormat: (formatterConfig: TextLintFormatterOption) => {
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
