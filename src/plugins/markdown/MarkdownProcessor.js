// LICENSE : MIT
"use strict";
import {parse} from "markdown-to-ast";
export default class MarkdownProcessor {
    constructor(config) {
        this.config = config;
    }

    static availableExtensions() {
        return [
            ".md",
            ".markdown",
            ".mdown",
            ".mkdn",
            ".mkd",
            ".mdwn",
            ".mkdown",
            ".ron"
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
                    filePath: filePath ? filePath : "<markdown>"
                };
            }
        };
    }
}
