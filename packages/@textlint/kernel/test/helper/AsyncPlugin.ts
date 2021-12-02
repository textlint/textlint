import { TextlintMessage } from "@textlint/kernel";
import type { TextlintPluginCreator, TextlintPluginProcessor } from "@textlint/types";
import { parse } from "@textlint/markdown-to-ast";

export interface AsyncProcessorOptions {
    testOption: string;
}

export interface CreateAsyncPluginOptions {
    extensions?: string[];
}

/**
 * Create Async Plugin stub
 * It spy the assigned argument.
 * It is compatible with markdown plugin by default.
 */
export const createAsyncPluginStub = (options?: CreateAsyncPluginOptions) => {
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
                Processor: class MockExampleProcessor implements TextlintPluginProcessor {
                    availableExtensions() {
                        return (options && options.extensions) || [".md"];
                    }

                    constructor(public options?: {}) {
                        assignedOptions = options;
                    }

                    processor(extension: string) {
                        processorArgs = { extension };
                        return {
                            async preProcess(text: string, filePath: string) {
                                preProcessArgs = { text, filePath };
                                return parse(text);
                            },
                            async postProcess(messages: TextlintMessage[], filePath: string) {
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
