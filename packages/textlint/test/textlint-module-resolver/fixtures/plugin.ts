// LICENSE : MIT
"use strict";

class Processor {
    static availableExtensions() {
        return [".x"];
    }

    availableExtensions() {
        return [".x"];
    }

    processor() {
        return {
            preProcess(text: string) {
                return text;
            },
            postProcess(messages: any[], filePath?: string) {
                return {
                    messages,
                    filePath: filePath ? filePath : "<x>"
                };
            }
        };
    }
}

export default {
    Processor
};
