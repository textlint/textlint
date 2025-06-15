// LICENSE : MIT
"use strict";
import { parse } from "@textlint/text-to-ast";
import type {
    TextlintPluginProcessor,
    TextlintPluginOptions,
    TextlintPluginPreProcessResult,
    TextlintPluginPostProcessResult
} from "@textlint/types";

export class TextProcessor implements TextlintPluginProcessor {
    config: TextlintPluginOptions;
    extensions: Array<string>;
    constructor(config = {}) {
        this.config = config;
        // support "extension" option
        this.extensions = this.config.extensions ? this.config.extensions : [];
    }

    availableExtensions() {
        return [".txt", ".text"].concat(this.extensions);
    }

    processor(_ext: string): {
        preProcess: (text: string, _filePath?: string) => TextlintPluginPreProcessResult;
        postProcess: (messages: Array<any>, filePath?: string) => TextlintPluginPostProcessResult;
    } {
        return {
            preProcess(text: string, _filePath?: string) {
                return parse(text);
            },
            postProcess(messages: Array<any>, filePath?: string): { messages: Array<any>; filePath: string } {
                return {
                    messages,
                    filePath: filePath ? filePath : "<text>"
                };
            }
        };
    }
}
