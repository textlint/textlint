// LICENSE : MIT
"use strict";
import type { TextlintMessage } from "@textlint/types";

export class ExampleProcessor {
    static availableExtensions() {
        return [".example"];
    }

    processor(_extension: string) {
        return {
            preProcess(_text: string, _filePath: string) {
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
            postProcess(messages: TextlintMessage[], filePath?: string) {
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
