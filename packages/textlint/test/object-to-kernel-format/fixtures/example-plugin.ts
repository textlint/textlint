import { TxtNode } from "@textlint/ast-node-types";
import { TextlintPluginProcessorConstructor } from "@textlint/kernel";

class ExampleProcessor {
    static availableExtensions() {
        return [".example"];
    }

    availableExtensions() {
        return [".example"];
    }

    processor(_extension: string) {
        return {
            preProcess(_text: string, _filePath: string): TxtNode {
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
            postProcess(messages: any[], filePath?: string) {
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
