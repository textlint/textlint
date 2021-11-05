import { TxtNode } from "@textlint/ast-node-types";
import { TextlintPluginCreator, TextlintPluginOptions } from "@textlint/types";

// MIT © 2017 azu
export class ExampleProcessor {
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
                    value: "",
                    raw: "",
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
            postProcess(messages: any[], filePath?: string) {
                return {
                    messages,
                    filePath: filePath || "unknown"
                };
            }
        };
    }
}

export const createPluginStub = () => {
    let assignedOptions: TextlintPluginOptions | undefined;
    return {
        getOptions() {
            return assignedOptions;
        },
        get plugin(): TextlintPluginCreator {
            return {
                Processor: class MockProcessor extends ExampleProcessor {
                    constructor(options?: TextlintPluginOptions) {
                        super();
                        assignedOptions = options;
                    }
                }
            };
        }
    };
};
