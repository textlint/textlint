import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TextlintResult } from "@textlint/types";
import { loadFormatter } from "../src/index.js";
import { createTestMessage } from "./test-helper.js";

/**
 * Make the escape sequences visible, so that the snapshots are readable as text
 */
const showControlCharacters = (value: string) => {
    return value.replaceAll("\u001B", "<ESC>");
};
const fixturesDir = path.join(__dirname, "fixtures");
const results: TextlintResult[] = [
    {
        filePath: path.join(fixturesDir, "ckj.md"),
        messages: [
            createTestMessage({
                ruleId: "no-todo",
                message: "日本語のメッセージ",
                severity: 2,
                line: 2,
                column: 5,
                fix: { range: [0, 1], text: "x" }
            }),
            createTestMessage({
                ruleId: "max-ten",
                message: "A long message that is wrapped in the table formatter, because it is longer than the column.",
                severity: 1,
                line: 3,
                column: 1
            }),
            createTestMessage({
                ruleId: "info-rule",
                message: "Info message.",
                severity: 3,
                line: 1,
                column: 10
            })
        ]
    }
];

describe("formatters with color", () => {
    const originalEnv = { ...process.env };
    beforeAll(() => {
        // `styleText` looks at the environment, because stdout of the test is not a TTY
        delete process.env.NO_COLOR;
        delete process.env.NODE_DISABLE_COLORS;
        process.env.FORCE_COLOR = "1";
    });
    afterAll(() => {
        for (const name of ["NO_COLOR", "NODE_DISABLE_COLORS", "FORCE_COLOR"]) {
            if (originalEnv[name] === undefined) {
                delete process.env[name];
            } else {
                process.env[name] = originalEnv[name];
            }
        }
    });
    // The formatters that use colors
    for (const formatterName of ["stylish", "pretty-error", "table"]) {
        it(`${formatterName} outputs colors`, async () => {
            const formatter = await loadFormatter({ formatterName, color: true });
            const output = formatter.format(results).replaceAll(`${fixturesDir}${path.sep}`, "<fixtures>/");
            await expect(showControlCharacters(output)).toMatchFileSnapshot(`./snapshots/color.${formatterName}.txt`);
        });
        it(`${formatterName} does not output colors with color: false`, async () => {
            const formatter = await loadFormatter({ formatterName, color: false });
            expect(formatter.format(results)).not.toContain("\u001B");
        });
    }
});
