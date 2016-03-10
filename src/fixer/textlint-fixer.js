import * as fs from "fs";
import format from "./formatters/compats";
/**
 * @param {TextLintResult} result
 */
function overWriteResult(result) {
    const targetFilePath = result.filePath;
    const output = result.output;
    fs.writeFileSync(targetFilePath, output, "utf-8");
}
function getMessageType(message) {
    if (message.fatal || message.severity === 2) {
        return "Error";
    } else {
        return "Warning";
    }
}
export default class TextLintFixer {
    /**
     *
     * @param {TextLintResult[]}results
     */
    constructor(results) {
        this.results = results;
    }

    findFixable(code, filePath) {

    }

    /**
     *
     * @param {TextLintMessage[]} lintMessageResult
     */
    fixFixable(lintMessageResult) {

    }

    formatResults(fixResults) {
        return format(fixResults);
    }

    write(fixResults) {
        fixResults.forEach(overWriteResult);
        return true;
    }
}
