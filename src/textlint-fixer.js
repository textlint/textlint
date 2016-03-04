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
function getMessageType(message) {
    if (message.fatal || message.severity === 2) {
        return "Error";
    } else {
        return "Warning";
    }
}
function format(results) {

    var output, total;
    output = "";
    total = 0;

    results.forEach(function (result) {

        var messages = result.applyingMessages;
        total += messages.length;

        messages.forEach(function (message) {
            output += "Fixed✔ ";
            output += result.filePath + ": ";
            output += "line " + (message.line || 0);
            output += ", col " + (message.column || 0);
            output += ", " + getMessageType(message);
            output += " - " + message.message;
            output += message.ruleId ? " (" + message.ruleId + ")" : "";
            output += "\n";

        });

    });

    if (total > 0) {
        output += "\n" + total + " problem" + (total !== 1 ? "s" : "");
    }

    return output;
}
export default class TextLintFixer {
    /**
     *
     * @param {TextLintResult[]}results
     */
    constructor(results) {
        this.results = results;
    }

    formatResults() {
        return format(this.results);
    }

    write() {
        this.results.forEach(overWriteResult);
        return true;
    }
}