// MIT © 2017 azu
import { TextlintMessage } from "@textlint/kernel";
import type { TextlintPluginCreator, TextlintPluginProcessor } from "@textlint/types";

const parse = require("@textlint/markdown-to-ast").parse;

export interface ExampleProcessorOptions {
    testOption: string;
}

export interface CreatePluginOptions {
    extensions?: string[];
}

/**
 * Create Plugin stub
 * It spy the assigned argument.
 * It is compatible with markdown plugin by default.
 */
export const createPluginStub = (options?: CreatePluginOptions) => {
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
                            preProcess(text: string, filePath: string) {
                                preProcessArgs = { text, filePath };
                                return parse(text);
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
