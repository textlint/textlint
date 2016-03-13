const Promise = require("bluebird");
const fs = require("fs");
/**
 * @param {TextLintResult} result
 */
function overWriteResult(result) {
    return new Promise((resolve, reject) => {
        const targetFilePath = result.filePath;
        const output = result.output;
        fs.writeFile(targetFilePath, output, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
}
export default class TextLintFixer {
    /**
     * write output to each files and return promise
     * @param textFixMessages
     * @returns {Promise}
     */
    write(textFixMessages) {
        const promises = textFixMessages.map(overWriteResult);
        return Promise.all(promises);
    }
}
