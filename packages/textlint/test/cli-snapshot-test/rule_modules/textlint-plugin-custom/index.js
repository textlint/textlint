/** @type {import("@textlint/types").TextlintPluginCreator} **/
module.exports = {
    /** @type {import("@textlint/types").TextlintPluginProcessor} */
    Processor: class {
        availableExtensions() {
            return [".custom"];
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
