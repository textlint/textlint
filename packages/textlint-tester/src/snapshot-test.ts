import { testerFormatter } from "./formatter";
import * as path from "path";
import * as assert from "assert";
import { TextLintCore } from "textlint";
import { TextlintFixResult, TextlintResult } from "@textlint/kernel";
import { getTestText } from "./test-util";

const snapShot = require("snap-shot-core");
export type TesterSnapshot = {
    text: string;
    ext?: string;
    inputPath?: string;
    options?: any;
};

export interface snapshotTestOptions {
    snapshotFileName: string;
    fix: boolean;
}

const escapeTemplateStringContent = (text: string) => {
    return text.replace(/`/g, "\\`").replace(/\${/g, "\\${");
};
export const snapshotTest = (textlint: TextLintCore, state: TesterSnapshot, options: snapshotTestOptions) => {
    const text = typeof state === "object" ? state.text : state;
    const inputPath = typeof state === "object" ? state.inputPath : undefined;
    const ext = typeof state === "object" && state.ext !== undefined ? state.ext : ".md";
    const actualText = getTestText({ text, inputPath });
    const singleName = actualText.split(/\n/g).join("_");
    it(singleName || "No Name", () => {
        const lintPromise: Promise<TextlintResult> = textlint.lintText(actualText, ext);
        const fixPromise: Promise<TextlintFixResult | undefined> = options.fix
            ? textlint.fixText(actualText, ext)
            : Promise.resolve(undefined);
        return Promise.all([lintPromise, fixPromise]).then(([lintResult, fixResult]) => {
            const output = testerFormatter(
                {
                    text: actualText,
                    result: lintResult,
                    fixResult
                },
                {
                    color: false,
                    formatterName: "tester"
                }
            );
            //             if (output.length === 0) {
            //                 throw new Error(`Snapshot should not be empty result.
            // If you want to test the text is valid, please add it to "valid"`);
            //             }
            // change current dir for snapshot
            // https://github.com/bahmutov/snap-shot-core/pull/51
            const cwd = process.cwd();
            const snapshotDir = path.dirname(options.snapshotFileName);
            try {
                process.chdir(snapshotDir);
            } catch (_error) {
                return Promise.reject(_error);
            }
            try {
                snapShot({
                    // Workaround*1: https://github.com/bahmutov/snap-shot-core/issues/117
                    what: output,
                    file: options.snapshotFileName, // aliases: file, __filename
                    specName: singleName, // or whatever name you want to give,
                    store: (text: string) => escapeTemplateStringContent(text),
                    raiser: ({
                        value, // current value
                        expected // loaded value
                    }: {
                        value: any;
                        expected: any;
                    }) => {
                        // Workaround*1: https://github.com/bahmutov/snap-shot-core/issues/117
                        // load value should be escaped with stored value
                        assert.deepStrictEqual(value, expected);
                    },
                    ext: ".snap",
                    opts: {
                        show: Boolean(process.env.SNAPSHOT_SHOW),
                        dryRun: Boolean(process.env.SNAPSHOT_DRY),
                        update: Boolean(process.env.SNAPSHOT_UPDATE)
                    }
                });
            } catch (error) {
                return Promise.reject(error);
            } finally {
                process.chdir(cwd);
            }
            return Promise.resolve();
        });
    });
};
