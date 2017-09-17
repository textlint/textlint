// LICENSE : MIT
"use strict";
class Processor {
    constructor(config) {
        this.config = config;
    }

    static availableExtensions() {
        return [".x"];
    }

    processor() {
        return {
            preProcess(text) {
                return text;
            },
            postProcess(messages) {
                return {
                    messages,
                    filePath: filePath ? filePath : "<x>"
                };
            }
        };
    }
}

export default {
    Processor: Processor
};
