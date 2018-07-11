// MIT © 2017 azu
import { TextlintPluginProcessor, TextlintPluginCreator } from "../../src/textlint-kernel-interface";
import { TextlintMessage } from "@textlint/kernel";

const parse = require("@textlint/markdown-to-ast").parse;

export interface ExampleProcessorOptions {
    testOption: string;
}

export const createPluginStub = () => {
    let assignedOptions: undefined | ExampleProcessorOptions | boolean;
    let processorArgs: [string];
    let preProcessArgs: [string, string];
    let postProcessArgs: [TextlintMessage[], string];
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
        getPlugin(): TextlintPluginCreator {
            return {
                Processor: class MockExampleProcessor implements TextlintPluginProcessor {
                    availableExtensions() {
                        return [".md"];
                    }

                    constructor(public options: any) {
                        assignedOptions = options;
                    }

                    processor(extension: string) {
                        processorArgs = [extension];
                        return {
                            preProcess(text: string, filePath: string) {
                                preProcessArgs = [text, filePath];
                                return parse(text);
                            },
                            postProcess(messages: TextlintMessage[], filePath: string) {
                                postProcessArgs = [messages, filePath];
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
