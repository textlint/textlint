import { Logger } from "./util/logger";
import type { CliOptions } from "./options";
import path from "path";
import fs from "fs";

export const showEmptyRuleWarning = () => {
    Logger.log(`
== No rules found, textlint hasn’t done anything ==

Possible reasons:
* Your textlint config file has no rules.
* You have no config file and you aren’t passing rules via command line.
* Your textlint config has a syntax error.

=> How to set up rules?
https://github.com/textlint/textlint/blob/master/docs/configuring.md
`);
};

/**
 * Print results of lining text.
 * @param {string} output the output text which is formatted by {@link TextLintEngine.formatResults}
 * @param {object} options cli option object {@lint ./options.js}
 * @returns {boolean} does print result success?
 */
export function printResults(output: string, options: CliOptions): boolean {
    if (!output) {
        return true;
    }
    const outputFile = options.outputFile;
    if (outputFile) {
        const filePath = path.resolve(process.cwd(), outputFile);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
            Logger.error("Cannot write to output file path, it is a directory: %s", outputFile);
            return false;
        }
        try {
            fs.mkdirSync(path.dirname(filePath), {
                recursive: true
            });
            fs.writeFileSync(filePath, output);
        } catch (ex) {
            Logger.error("There was a problem writing the output file:\n%s", ex);
            return false;
        }
    } else {
        Logger.log(output);
    }
    return true;
}
