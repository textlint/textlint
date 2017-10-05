// MIT © 2017 azu
import {
    TextlintKernelProcessor,
    TextLintPluginCreator
} from "../../src/textlint-kernel-interface";

const parse = require("markdown-to-ast").parse;

export interface ExampleProcessorOptions {
    testOption: string;
}

export class ExampleProcessor implements TextlintKernelProcessor {
    static availableExtensions() {
        return [".md"];
    }

    constructor(public options: ExampleProcessorOptions) {}

    processor(_extension: string) {
        return {
            preProcess(text: string, _filePath: string | undefined) {
                return parse(text);
            },
            postProcess(messages: any[], filePath: string | undefined) {
                return {
                    messages,
                    filePath: filePath || "unknown"
                };
            }
        };
    }
}

export const plugin: TextLintPluginCreator = {
    Processor: ExampleProcessor
};

export const createPluginStub = () => {
    let assignedOptions: undefined | ExampleProcessorOptions;
    return {
        getOptions() {
            return assignedOptions;
        },
        getPlugin(): TextLintPluginCreator {
            return {
                Processor: class MockProcessor extends ExampleProcessor {
                    constructor(options: ExampleProcessorOptions) {
                        super(options);
                        assignedOptions = options;
                    }
                }
            };
        }
    };
};
