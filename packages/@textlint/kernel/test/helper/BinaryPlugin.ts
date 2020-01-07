// MIT © 2017 azu
import { TextlintMessage } from "@textlint/kernel";
import { TextlintPluginCreator, TextlintPluginProcessor } from "@textlint/types";

export interface BinaryPluginProcessorOptions {
    testOption: string;
}

export interface CreateBinaryPluginOptions {
    extensions?: string[];
    /**
     * Return the text instead of file content.
     * It simulate intermediate text for a binary,
     */
    dummyText?: string;
}

/**
 * Create Binary Plugin stub
 * It spy the assigned argument.
 * this plugin's preprocess return {text, ast}
 * https://github.com/textlint/textlint/issues/649
 */
export const createBinaryPluginStub = (options?: CreateBinaryPluginOptions) => {
    let assignedOptions: undefined | {};
    let processorArgs: {
        extension: string;
    };
    let preProcessArgs: {
        text: string;
        filePath: string;
    };
    let postProcessArgs: {
        messages: TextlintMessage[];
        filePath?: string;
    };
    return {
        getOptions() {
            return assignedOptions;
        },
        getProcessorArgs() {
            return processorArgs;
        },
        getPreProcessArgs() {
            return preProcessArgs;
        },
        getPostProcessArgs() {
            return postProcessArgs;
        },
        /**
         * Return plugin module
         */
        get plugin(): TextlintPluginCreator {
            return {
                Processor: class MockBinaryPluginProcessor implements TextlintPluginProcessor {
                    availableExtensions() {
                        return (options && options.extensions) || [".out"];
                    }

                    constructor(public options?: {}) {
                        assignedOptions = options;
                    }

                    processor(extension: string) {
                        processorArgs = { extension };
                        // use dummyText instead of binary
                        // return { text, ast }
                        return {
                            preProcess(text: string, filePath: string) {
                                preProcessArgs = { text, filePath };
                                const dummyText = (options && options.dummyText) || "this is binary";
                                const ast = {
                                    type: "Document",
                                    raw: dummyText,
                                    range: [0, dummyText.length] as [number, number],
                                    loc: {
                                        start: {
                                            line: 1,
                                            column: 0
                                        },
                                        end: {
                                            line: 1,
                                            column: dummyText.length - 1
                                        }
                                    },
                                    children: [
                                        {
                                            type: "Str",
                                            value: dummyText,
                                            raw: dummyText,
                                            range: [0, dummyText.length] as [number, number],
                                            loc: {
                                                start: {
                                                    line: 1,
                                                    column: 0
                                                },
                                                end: {
                                                    line: 1,
                                                    column: dummyText.length - 1
                                                }
                                            }
                                        }
                                    ]
                                };
                                return {
                                    text: dummyText,
                                    ast
                                };
                            },
                            postProcess(messages: TextlintMessage[], filePath: string) {
                                postProcessArgs = { messages, filePath };
                                return {
                                    messages,
                                    filePath: filePath || "unknown"
                                };
                            }
                        };
                    }
                }
            };
        }
    };
};
