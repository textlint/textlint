// Simple markdown plugin implementation for testing
module.exports = {
    Processor: class {
        availableExtensions() {
            return [".md", ".markdown"];
        }

        processor() {
            return {
                preProcess(text) {
                    return text;
                },
                postProcess(messages) {
                    return messages;
                }
            };
        }
    }
};
