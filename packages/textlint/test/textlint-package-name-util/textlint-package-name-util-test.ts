import * as assert from "assert";
import { createFullPackageName, removePrefixFromPackageName } from "../../src/engine/textlint-package-name-util";

describe("textlint-package-name-util", () => {
    describe("removePrefixFromPackageName", () => {
        const patterns = [
            {
                before: "textlint-rule-<name>",
                after: "<name>",
                prefix: "textlint-rule-"
            },
            {
                before: "<name>",
                after: "<name>",
                prefix: "textlint-rule-"
            },
            {
                before: "@scope/textlint-rule-<name>",
                after: "@scope/<name>",
                prefix: "textlint-rule-"
            },
            // preset
            {
                before: "textlint-rule-preset-<name>",
                after: "<name>",
                prefix: "textlint-rule-preset-"
            },
            {
                before: "@scope/textlint-rule-preset-<name>",
                after: "@scope/<name>",
                prefix: "textlint-rule-preset-"
            }
        ];
        patterns.forEach((pattern) => {
            it(`${pattern.before} -> ${pattern.after}`, () => {
                assert.strictEqual(removePrefixFromPackageName([pattern.prefix], pattern.before), pattern.after);
            });
        });
    });
    describe("createFullPackageName", () => {
        const PREFIX = "textlint-rule-";
        it("<name> -> textlint-rule-<name>", () => {
            assert.strictEqual(createFullPackageName(PREFIX, "name"), "textlint-rule-name");
        });
        it("textlint-rule-<name> -> textlint-rule-<name>", () => {
            assert.strictEqual(createFullPackageName(PREFIX, "textlint-rule-name"), "textlint-rule-textlint-rule-name");
        });
        it("@scope/<name> -> @scope/textlint-rule-<name>", () => {
            assert.strictEqual(createFullPackageName(PREFIX, "@scope/name"), "@scope/textlint-rule-name");
        });
        it("@scope/textlint-rule-<name> -> @scope/textlint-rule-<name>", () => {
            assert.strictEqual(
                createFullPackageName(PREFIX, "@scope/textlint-rule-name"),
                "@scope/textlint-rule-textlint-rule-name"
            );
        });
        it("@scope/preset-<name> -> @scope/textlint-rule-preset-<name>", () => {
            assert.strictEqual(createFullPackageName(PREFIX, "@scope/preset-name"), "@scope/textlint-rule-preset-name");
        });
    });
});
