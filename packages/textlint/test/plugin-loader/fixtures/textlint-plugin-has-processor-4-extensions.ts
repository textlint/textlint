// LICENSE : MIT
"use strict";

class TestProcessor {
    static availableExtensions() {
        return [".test1", ".test2", ".test3", ".test4"];
    }

    processor(_ext: string) {
        return {
            preProcess(text: string, _filePath?: string) {
                return text;
            },
            postProcess(messages: any[], filePath: string) {
                return {
                    messages,
                    filePath
                };
            }
        };
    }
}
export default {
    Processor: TestProcessor
};
