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
            cwd: path.join(__dirname, "fixtures"),
            descriptor
        });
        const results = await linter.lintText("test", "test.md");
        assert.strictEqual(results.messages.length, 2);
        const hasESMResult = results.messages.some((message) => message.message === "ESM");
        const hasCJSResult = results.messages.some((message) => message.message === "CJS");
        assert.ok(hasESMResult, "ESM");
        assert.ok(hasCJSResult, "CJS");
    });
    describe("linter.scanFilePath", () => {
        it("should not use .textlintignore by default", async () => {
            const descriptor = await loadTextlintrc({
                configFilePath: path.join(__dirname, "fixtures/.textlintrc.json"),
                node_modulesDir: path.join(__dirname, "fixtures/modules")
            });
            const linter = createLinter({
                cwd: path.resolve(__dirname, "fixtures"),
                descriptor
                // No ignoreFilePath
            });
            const result = await linter.scanFilePath(path.join(__dirname, "fixtures/test-files/ignored.md"));
            assert.strictEqual(result.status, "ok");
        });
        it("should return 'ignored' if the file path is ignored", async () => {
            const descriptor = await loadTextlintrc({
                configFilePath: path.join(__dirname, "fixtures/.textlintrc.json"),
                node_modulesDir: path.join(__dirname, "fixtures/modules")
            });
            const linter = createLinter({
                cwd: path.resolve(__dirname, "fixtures"),
                descriptor,
                ignoreFilePath: path.join(__dirname, "fixtures/.textlintignore")
            });
            const result = await linter.scanFilePath(path.join(__dirname, "fixtures/test-files/ignored.md"));
            assert.strictEqual(result.status, "ignored");
        });
        it("should return 'ok' if the file path is not ignored", async () => {
            const descriptor = await loadTextlintrc({
                configFilePath: path.join(__dirname, "fixtures/.textlintrc.json"),
                node_modulesDir: path.join(__dirname, "fixtures/modules")
            });
            const linter = createLinter({
                cwd: path.resolve(__dirname, "fixtures"),
                descriptor,
                ignoreFilePath: path.join(__dirname, "fixtures/.textlintignore")
            });
            const result = await linter.scanFilePath(path.join(__dirname, "fixtures/test-files/test.md"));
            assert.strictEqual(result.status, "ok");
        });
    });
});
