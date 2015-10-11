// LICENSE : MIT
"use strict";
const markdownExtensions = require("markdown-extensions");
import {parse} from "markdown-to-ast";
export default class MarkdownProcessor {
    constructor(config) {
        this.config = config;
    }

    availableExtensions() {
        return markdownExtensions;
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
