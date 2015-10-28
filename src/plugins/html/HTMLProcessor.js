// LICENSE : MIT
"use strict";
import {parse} from "./html-to-ast";
export default class HTMLProcessor {
    constructor(config) {
        this.config = config;
    }

    static availableExtensions() {
        return [
            ".html"
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
                    filePath: filePath ? filePath : "<html>"
                };
            }
        };
    }
}
