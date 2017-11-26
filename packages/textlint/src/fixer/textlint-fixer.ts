import Promise = require("bluebird");
const fs = require("fs");
import { TextlintTypes } from "@textlint/kernel";
function overWriteResult(result: TextlintTypes.TextlintFixResult) {
    return new Promise((resolve, reject) => {
        const targetFilePath = result.filePath;
        const output = result.output;
        fs.writeFile(targetFilePath, output, (error: any, result: TextlintTypes.TextlintFixResult) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
}
export class TextLintFixer {
    /**
     * write output to each files and return promise
     * @param textFixMessages
     * @returns {Promise}
     */
    write(textFixMessages: TextlintTypes.TextlintFixResult[]) {
        const promises = textFixMessages.map(overWriteResult);
        return Promise.all(promises);
    }
}
