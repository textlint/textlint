import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "vitest";

/**
 * The helpers are copies of @textlint/linter-formatter.
 * They are not shared through @textlint/utils, because @textlint/utils is loaded in browsers by @textlint/kernel,
 * and the helpers use `node:util`.
 */
describe("helpers", () => {
    for (const fileName of ["string-width.ts", "align-columns.ts"]) {
        it(`${fileName} is the same as @textlint/linter-formatter`, () => {
            const actual = fs.readFileSync(path.join(__dirname, "../../src/helper", fileName), "utf-8");
            const expected = fs.readFileSync(
                path.join(__dirname, "../../../linter-formatter/src/helper", fileName),
                "utf-8"
            );
            assert.strictEqual(actual, expected, `Copy linter-formatter/src/helper/${fileName} to fixer-formatter`);
        });
    }
});
