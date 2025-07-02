import type { TxtDocumentNode } from "@textlint/ast-node-types";
import { TextlintPluginProcessorConstructor } from "@textlint/kernel";
import type { TextlintMessage } from "@textlint/types";

class ExampleProcessor {
    static availableExtensions() {
        return [".example"];
    }

    availableExtensions() {
        return [".example"];
    }

    processor(_extension: string) {
        return {
            preProcess(_text: string, _filePath: string): TxtDocumentNode {
                return {
                    type: "Document",
                    children: [],
                    range: [0, 0],
                    raw: "",
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
    Processor: ExampleProcessor as TextlintPluginProcessorConstructor
};
