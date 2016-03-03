// LICENSE : MIT
"use strict";
import * as fs from "fs";

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

    write() {
        this.results.forEach(overWriteResult);
        return true;
    }
}