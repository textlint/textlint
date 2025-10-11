import { TextlintPluginCreator } from "../../../src/index.js";
import type { TextlintMessage, TextlintPluginPostProcessResult } from "@textlint/types";
import type { TxtDocumentNode } from "@textlint/ast-node-types";

export const createDummyPlugin = (extensions: string[] = [".dummy"]): TextlintPluginCreator => {
    return {
        Processor: class DummyProcessor {
            availableExtensions() {
                return extensions;
            }

            processor() {
                return {
                    preProcess(_: string) {
                        return {
                            type: "Document",
                            children: [],
                            raw: "",
                            loc: {
                                start: { line: 1, column: 1 },
                                end: { line: 1, column: 1 }
                            },
                            range: [0, 0]
                        } as TxtDocumentNode;
                    },
                    postProcess(messages: Array<TextlintMessage>, _filePath?: string) {
                        return {
                            messages,
                            filePath: "<dummy>"
                        } as TextlintPluginPostProcessResult;
                    }
                };
            }
        }
    };
};
