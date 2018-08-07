import { testerFormatter } from "./formatter";
import * as path from "path";
import * as assert from "assert";
import { TextLintCore } from "../../textlint/src";
import { TextlintFixResult, TextlintResult } from "@textlint/kernel";

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

export const snapshotTest = (textlint: TextLintCore, state: TesterSnapshot, options: snapshotTestOptions) => {
    const text = typeof state === "object" ? state.text : state;
    const inputPath = typeof state === "object" ? state.inputPath : undefined;
    const ext = typeof state === "object" && state.ext !== undefined ? state.ext : ".md";
    const singleName = text.split(/\n/g).join("_");
    it(text || inputPath || "NO name", () => {
        const lintPromise: Promise<TextlintResult> = textlint.lintText(text, ext);
        const fixPromise: Promise<TextlintFixResult | void> = options.fix
            ? textlint.fixText(text, ext)
            : Promise.resolve();
        return Promise.all([lintPromise, fixPromise]).then(([lintResult, fixResult]) => {
            const output = testerFormatter(text, [lintResult], {
                color: false,
                formatterName: "tester"
            });
            //             if (output.length === 0) {
            //                 throw new Error(`Snapshot should not be empty result.
            // If you want to test the text is valid, please add it to "valid"`);
            //             }

            const snapshotOutput = `${text}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
${fixResult ? fixResult.output : "[[NO OUTPUT]]"}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
${output ? output : "[[NO LINT MESSAGE]]"}`;
            // change current dir for snapshot
            // https://github.com/bahmutov/snap-shot-core/pull/51
            const cwd = process.cwd();
            const snapshotDir = path.dirname(options.snapshotFileName);
            try {
                process.chdir(snapshotDir);
            } catch (_error) {
                // nope
            }
            try {
                snapShot({
                    what: snapshotOutput,
                    file: options.snapshotFileName, // aliases: file, __filename
                    specName: singleName, // or whatever name you want to give,
                    raiser: ({
                        value, // current value
                        expected // loaded value
                    }: {
                        value: any;
                        expected: any;
                    }) => {
                        assert.deepStrictEqual(value, expected);
                    },
                    ext: ".snap",
                    opts: {
                        show: Boolean(process.env.SNAPSHOT_SHOW),
                        dryRun: Boolean(process.env.SNAPSHOT_DRY),
                        update: Boolean(process.env.SNAPSHOT_UPDATE)
                    }
                });
            } finally {
                process.chdir(cwd);
            }
        });
    });
};
