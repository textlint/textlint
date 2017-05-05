/* eslint-disable no-unused-vars */
// LICENSE : MIT
"use strict";
import { parse } from "txt-to-ast";
export class TextProcessor {
    constructor(config) {
        this.config = config;
    }

    static availableExtensions() {
        return [
            ".txt",
            ".text"
        ];
    }

    processor(ext) {
        return {
            preProcess(text, filePath) {
                return parse(text);
            },
            postProcess(messages, filePath) {
                return {
                    messages,
                    filePath: filePath ? filePath : "<text>"
                };
            }
        };
    }
}
