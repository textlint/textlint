/** @type {import("@textlint/types").TextlintPluginCreator} **/
export default {
    /** @type {import("@textlint/types").TextlintPluginProcessor} */
    Processor: class {
        availableExtensions() {
            return [".esm"];
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
