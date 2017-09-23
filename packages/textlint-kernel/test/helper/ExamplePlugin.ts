// MIT © 2017 azu
import { TextlintKernelProcessor, TextLintPluginCreator } from "../../src/textlint-kernel-interface";

const parse = require("markdown-to-ast").parse;

export class Processor implements TextlintKernelProcessor {
    static availableExtensions() {
        return [".md"];
    }

    constructor(_option = {}) {}

    processor(_extension: string) {
        return {
            preProcess(text: string, _filePath: string | undefined) {
                return parse(text);
            },
            postProcess(messages: any[], filePath: string | undefined) {
                return {
                    messages,
                    filePath: filePath || "unknown"
                };
            }
        };
    }
}

export const plugin: TextLintPluginCreator = {
    Processor: Processor
};
