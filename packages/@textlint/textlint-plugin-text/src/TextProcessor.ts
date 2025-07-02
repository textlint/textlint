// LICENSE : MIT
"use strict";
import { parse } from "@textlint/text-to-ast";
import type {
    TextlintPluginProcessor,
    TextlintPluginOptions,
    TextlintPluginPreProcessResult,
    TextlintPluginPostProcessResult,
    TextlintMessage
} from "@textlint/types";

export class TextProcessor implements TextlintPluginProcessor {
    config: TextlintPluginOptions;
    extensions: Array<string>;
    constructor(config: TextlintPluginOptions = {}) {
        this.config = config;
        // support "extension" option
        this.extensions = this.config.extensions ? this.config.extensions as string[] : [];
    }

    availableExtensions() {
        return [".txt", ".text"].concat(this.extensions);
    }

    processor(_ext: string): {
        preProcess: (text: string, _filePath?: string) => TextlintPluginPreProcessResult;
        postProcess: (messages: Array<TextlintMessage>, filePath?: string) => TextlintPluginPostProcessResult;
    } {
        return {
            preProcess(text: string, _filePath?: string) {
                return parse(text);
            },
            postProcess(messages: Array<TextlintMessage>, filePath?: string): { messages: Array<TextlintMessage>; filePath: string } {
                return {
                    messages,
                    filePath: filePath ? filePath : "<text>"
                };
            }
        };
    }
}
