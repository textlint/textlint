// Simple text plugin implementation for testing
module.exports = {
    Processor: class {
        availableExtensions() {
            return [".txt", ".md"];
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
