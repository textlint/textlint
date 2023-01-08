import { TextlintPluginCreator } from "@textlint/types";

export const ThrowPlugin: TextlintPluginCreator = {
    Processor: class ThrowPluginProcessor {
        availableExtensions() {
            return [".txt", ".md"];
        }

        processor() {
            return {
                preProcess(_text: string) {
                    const snapshotError = new Error("ThrowPlugin Error");
                    snapshotError.stack = "<ThrowPlugin Error's stack>";
                    // throw snapshotError instead of actual Error
                    throw snapshotError;
                },
                postProcess() {
                    throw new Error("POST PROCESS ERROR");
                }
            };
        }
    }
};
