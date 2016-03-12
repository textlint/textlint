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
export default class TextLintFixer {
    /**
     *
     * @param {TextLintResult[]}results
     */
    constructor(results) {
        this.results = results;
    }

    formatResults(fixResults) {
        return format(fixResults);
    }

    write(textFixMessages) {
        textFixMessages.forEach(overWriteResult);
        return true;
    }
}
