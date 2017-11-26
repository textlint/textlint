/// <reference types="bluebird" />
import Promise = require("bluebird");
import { TextlintTypes } from "@textlint/kernel";
export declare class TextLintFixer {
    /**
     * write output to each files and return promise
     * @param textFixMessages
     * @returns {Promise}
     */
    write(textFixMessages: TextlintTypes.TextlintFixResult[]): Promise<{}[]>;
}
