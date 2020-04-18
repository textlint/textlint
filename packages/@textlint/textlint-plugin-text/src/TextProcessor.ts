/* eslint-disable no-unused-vars */
// LICENSE : MIT
"use strict";
import { parse } from "@textlint/text-to-ast";
import { TextlintPluginProcessor, TextlintPluginOptions } from "@textlint/types";
import { TxtParentNode } from "@textlint/ast-node-types/src";

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

    processor(_ext: string) {
        return {
            preProcess(text: string, _filePath?: string): TxtParentNode | { text: string; ast: TxtParentNode } {
                // FIXME: remove any
                return parse(text) as any;
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
