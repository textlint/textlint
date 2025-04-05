"use strict";
import { AbstractTextLintEngine } from "./engine/textlint-engine-core";
import { createFormatter } from "@textlint/fixer-formatter";
import { TextLintCore } from "./textlint-core";
import { TextLintFormatterOption } from "../textlint-interface";
import { TextlintFixResult } from "@textlint/kernel";
import { Logger } from "../util/logger";

/**
 * TextFixEngine a adapter for TextLintEngineCore.
 * It aim to pull the whole look together. (TextLintEngine and TextFixEngine)
 * @deprecated use new APIs https://textlint.org/docs/use-as-modules.html#new-apis
 */
export class TextFixEngine extends AbstractTextLintEngine<TextlintFixResult> {
    constructor(...args: any[]) {
        super(...args);
        Logger.deprecate(
            "TextFixEngine is deprecated. Please use new APIs https://github.com/textlint/textlint/issues/1310"
        );
    }
    /**
     * @param {TextLintCore} textlintCore
     * @returns {function()}
     */
    onFile = (textlintCore: TextLintCore) => {
        /**
         * Fixes the current configuration on an array of file and directory names.
         * TextFixEngine#executeOnFiles
         * @returns {TextlintFixResult[]} The results for all files that were linted.
         */
        return (file: string) => {
            return textlintCore.fixFile(file);
        };
    };
    /**
     * @param {TextLintCore} textlintCore
     * @returns {function()}
     */
    onText = (textlintCore: TextLintCore) => {
        /**
         * Fix texts with ext option.
         * TextFixEngine#executeOnText
         * @param {string} text linting text content
         * @param {string} [ext] ext is a type for linting. default: ".txt"
         * @returns {TextlintFixResult[]}
         */
        return (text: string, ext?: string) => {
            return textlintCore.fixText(text, ext);
        };
    };

    /**
     * @param {TextLintFormatterOption} formatterConfig
     */
    onFormat = (formatterConfig: TextLintFormatterOption) => {
        return createFormatter(formatterConfig);
    };
}
