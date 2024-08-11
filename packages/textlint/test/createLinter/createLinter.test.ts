import path from "path";
import assert from "assert";
import { createLinter, loadTextlintrc } from "../../src";

describe("createLinter", () => {
    it("should load ESM/CJS rules", async () => {
        const descriptor = await loadTextlintrc({
            configFilePath: path.join(__dirname, "fixtures/.textlintrc.json"),
            node_modulesDir: path.join(__dirname, "fixtures/modules")
        });
        const linter = createLinter({
            descriptor
        });
        const results = await linter.lintText("test", "test.md");
        assert.strictEqual(results.messages.length, 2);
        const hasESMResult = results.messages.some((message) => message.message === "ESM");
        const hasCJSResult = results.messages.some((message) => message.message === "CJS");
        assert.ok(hasESMResult, "ESM");
        assert.ok(hasCJSResult, "CJS");
    });
    describe("linter.isFilePathIgnored", () => {
        it("should return true if the file path is ignored", async () => {
            const descriptor = await loadTextlintrc({
                configFilePath: path.join(__dirname, "fixtures/.textlintrc.json"),
                node_modulesDir: path.join(__dirname, "fixtures/modules")
            });
            const linter = createLinter({
                descriptor,
                ignoreFilePath: path.join(__dirname, "fixtures/.textlintignore")
            });
            const result = await linter.isFilePathIgnored(path.join(__dirname, "fixtures/test-files/ignored.md"));
            assert.strictEqual(result, true);
        });
        it("should return false if the file path is not ignored", async () => {
            const descriptor = await loadTextlintrc({
                configFilePath: path.join(__dirname, "fixtures/.textlintrc.json"),
                node_modulesDir: path.join(__dirname, "fixtures/modules")
            });
            const linter = createLinter({
                descriptor,
                ignoreFilePath: path.join(__dirname, "fixtures/.textlintignore")
            });
            const result = await linter.isFilePathIgnored(path.join(__dirname, "fixtures/test-files/test.md"));
            assert.strictEqual(result, false);
        });
    });
});
