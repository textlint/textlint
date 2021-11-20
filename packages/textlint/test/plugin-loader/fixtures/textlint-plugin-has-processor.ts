// LICENSE : MIT
"use strict";
class TestProcessor {
    static availableExtensions() {
        return [".test"];
    }

    processor(_ext: string) {
        return {
            preProcess(text: string, _filePath: string) {
                return text;
            },
            postProcess(messages: string, filePath: string) {
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
