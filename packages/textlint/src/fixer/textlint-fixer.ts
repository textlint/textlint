import { TextlintFixResult } from "@textlint/kernel";
import fs from "fs/promises";

function overWriteResult(result: TextlintFixResult): Promise<void> {
    const targetFilePath = result.filePath;
    const output = result.output;
    return fs.writeFile(targetFilePath, output);
}

export class TextLintFixer {
    /**
     * write output to each file and return promise
     * @param textFixMessages
     * @returns {Promise}
     */
    write(textFixMessages: TextlintFixResult[]): Promise<void[]> {
        const promises = textFixMessages.map(overWriteResult);
        return Promise.all(promises);
    }
}
