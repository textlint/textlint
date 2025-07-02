import { TextlintPluginCreator } from "../../../src/index.js";
import type { TextlintPluginPreProcessResult, TextlintMessage, TextlintPluginPostProcessResult } from "@textlint/types";

export const createDummyPlugin = (extensions: string[] = [".dummy"]): TextlintPluginCreator => {
    return {
        Processor: class DummyProcessor {
            availableExtensions() {
                return extensions;
            }

            processor() {
                return {
                    preProcess(_: string) {
                        return {} as TextlintPluginPreProcessResult;
                    },
                    postProcess(_messages: Array<TextlintMessage>, _filePath?: string) {
                        return {} as TextlintPluginPostProcessResult;
                    }
                };
            }
        }
    };
};
