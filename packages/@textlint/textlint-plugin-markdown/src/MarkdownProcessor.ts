// LICENSE : MIT
"use strict";
import { parse } from "@textlint/markdown-to-ast";
import type {
    TextlintPluginOptions,
    TextlintPluginPreProcessResult,
    TextlintPluginPostProcessResult,
    TextlintMessage
} from "@textlint/types";

export class MarkdownProcessor {
    config: TextlintPluginOptions;
    extensions: Array<string>;
    constructor(config: TextlintPluginOptions = {}) {
        this.config = config;
        this.extensions = this.config.extensions ? this.config.extensions as string[] : [];
    }

    availableExtensions() {
        return [".md", ".markdown", ".mdown", ".mkdn", ".mkd", ".mdwn", ".mkdown", ".ron"].concat(this.extensions);
    }

    processor(_ext: string): {
        preProcess: (text: string, _filePath?: string) => TextlintPluginPreProcessResult;
        postProcess: (messages: TextlintMessage[], filePath?: string) => TextlintPluginPostProcessResult;
    } {
        return {
            preProcess(text: string, _filePath?: string) {
                return parse(text);
            },
            postProcess(messages: TextlintMessage[], filePath?: string) {
                return {
                    messages,
                    filePath: filePath ? filePath : "<markdown>"
                };
            }
        };
    }
}
