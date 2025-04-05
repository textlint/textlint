"use strict";
import { createFormatter } from "@textlint/linter-formatter";
import { AbstractTextLintEngine } from "./engine/textlint-engine-core";
import { TextLintCore } from "./textlint-core";
import { TextLintFormatterOption } from "../textlint-interface";
import { TextlintResult } from "@textlint/kernel";
import { Logger } from "../util/logger";

/**
 * TextLintEngine a adapter for TextLintEngineCore.
 * It aim to pull the whole look together. (TextLintEngine and TextFixEngine)
 * @deprecated use new APIs https://textlint.org/docs/use-as-modules.html#new-apis
 */
export class TextLintEngine extends AbstractTextLintEngine<TextlintResult> {
    constructor(...args: any[]) {
        super(...args);
        Logger.deprecate(
            "TextLintEngine is deprecated. Please use new APIs https://github.com/textlint/textlint/issues/1310"
        );
    }
    /**
     * @param {TextLintCore} textlintCore
     * @returns {function()}
     */
    onFile = (textlintCore: TextLintCore) => {
        /**
         * Executes the current configuration on an array of file and directory names.
         * TextLintEngine#executeOnFile
         * @param {String} file An array of file and directory names.
         * @returns {TextlintResult[]} The results for all files that were linted.
         */
        return function executeOnFile(file: string) {
            return textlintCore.lintFile(file);
        };
    };
    /**
     * @param {TextLintCore} textlintCore
     * @returns {function()}
     */
    onText = (textlintCore: TextLintCore) => {
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
    };

    /**
     * @param {TextLintFormatterOption} formatterConfig
     */
    onFormat = (formatterConfig: TextLintFormatterOption) => {
        return createFormatter(formatterConfig);
    };
}
