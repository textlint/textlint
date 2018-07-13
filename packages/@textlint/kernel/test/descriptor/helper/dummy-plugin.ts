import { TextlintPluginCreator } from "@textlint/kernel";

export const createDummyPlugin = (extensions: string[] = [".dummy"]): TextlintPluginCreator => {
    return {
        Processor: class DummyProcessor {
            availableExtensions() {
                return extensions;
            }

            processor() {
                return {
                    preProcess(_: string) {
                        return {} as any;
                    },
                    postProcess(_messages: Array<any>, _filePath?: string) {
                        return {} as any;
                    }
                };
            }
        }
    };
};
