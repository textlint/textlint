"use strict";
import { TextLintEngineCore } from "./engine/textlint-engine-core";
import { createFormatter } from "textlint-fixer-formatter";
import { Config } from "./config/config";
import { TextLintCore } from "./textlint-core";
import { TextLintFormatterOption } from "./textlint-interface";
/**
 * TextFixEngine a adapter for TextLintEngineCore.
 * It aim to pull the whole look together. (TextLintEngine and TextFixEngine)
 */
export class TextFixEngine {
    /**
     * TextFixEngine is a adaptor of TextLintEngineCore.
     * @param {Config|Object} [config]
     * @returns {TextLintEngineCore}
     */
    constructor(config: Config | object) {
        const executor = {
            /**
             * @param {TextLintCore} textlintCore
             * @returns {function()}
             */
            onFile: (textlintCore: TextLintCore) => {
                /**
                 * Fixes the current configuration on an array of file and directory names.
                 * TextFixEngine#executeOnFiles
                 * @returns {TextlintFixResult[]} The results for all files that were linted.
                 */
                return (file: string) => {
                    return textlintCore.fixFile(file);
                };
            },
            /**
             * @param {TextLintCore} textlintCore
             * @returns {function()}
             */
            onText: (textlintCore: TextLintCore) => {
                /**
                 * Fix texts with ext option.
                 * TextFixEngine#executeOnText
                 * @param {string} text linting text content
                 * @param {string} ext ext is a type for linting. default: ".txt"
                 * @returns {TextlintFixResult[]}
                 */
                return (text: string, ext: string) => {
                    return textlintCore.fixText(text, ext);
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
