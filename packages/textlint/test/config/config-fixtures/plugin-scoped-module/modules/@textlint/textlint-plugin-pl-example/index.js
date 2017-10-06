// LICENSE : MIT
"use strict";

export class ExampleProcessor {
    static availableExtensions() {
        return [".example"];
    }

    constructor(options) {
        this.options = options;
    }

    processor(_extension) {
        return {
            preProcess(text, _filePath) {
                return {
                    type: "Document",
                    children: [],
                    range: [0, 0],
                    loc: {
                        start: {
                            line: 0,
                            column: 0
                        },
                        end: {
                            line: 0,
                            column: 0
                        }
                    }
                };
            },
            postProcess(messages, filePath) {
                return {
                    messages,
                    filePath: filePath || "unknown"
                };
            }
        };
    }
}

export default {
    Processor: ExampleProcessor
};
