import * as assert from "assert";
import path from "path";
import { scanFilePath, searchFiles } from "../../src/util/find-util";

// absolute option replaces \ in filename to / #379
// https://github.com/mrmlnc/fast-glob/issues/371
// https://github.com/mrmlnc/fast-glob/issues/379
const bugFixFastGlobInWindows = (filePaths: string[]) => {
    return filePaths.map((filePath) => path.resolve(filePath));
};
const cwd = path.resolve(__dirname, "fixtures/find-util");
describe("find-util", () => {
    describe("searchFiles", () => {
        it("should find files with relative path pattern", async () => {
            const patterns = ["dir/**/*.md"];
            const files = await searchFiles(patterns, { cwd });
            assert.ok(files.ok);
            assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find files with absolute path pattern", async () => {
            const patterns = ["dir/**/*.md"];
            const files = await searchFiles(patterns, { cwd });
            assert.ok(files.ok);
            assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find dot files", async () => {
            const patterns = ["dir/**/*.md"];
            const files = await searchFiles(patterns, { cwd });
            assert.ok(files.ok);
            assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find files with multiple path patterns", async () => {
            const patterns = ["dir/**/*.md", "ignored/**/*.md"];
            const files = await searchFiles(patterns, { cwd });
            assert.ok(files.ok);
            assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md"),
                path.resolve(cwd, "ignored/subdir/test.md"),
                path.resolve(cwd, "ignored/test.md")
            ]);
        });
        context("when specify `ignoreFilePath` option", () => {
            it("should find files with relative path patterns", async () => {
                const patterns = ["**/*.md"];
                const files = await searchFiles(patterns, {
                    cwd,
                    ignoreFilePath: ".textlintignore"
                });
                assert.ok(files.ok);
                assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                    path.resolve(cwd, "dir/subdir/test.md"),
                    path.resolve(cwd, "dir/test.md")
                ]);
            });
            it("should find files with absolute path patterns", async () => {
                const patterns = ["**/*.md"];
                const files = await searchFiles(patterns, {
                    cwd,
                    ignoreFilePath: ".textlintignore"
                });
                assert.ok(files.ok);
                assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                    path.resolve(cwd, "dir/subdir/test.md"),
                    path.resolve(cwd, "dir/test.md")
                ]);
            });
            // Issue: https://github.com/textlint/textlint/issues/1408
            it("should respect ignore file if pattern is absolute file path", async () => {
                const patterns = ["ignored/test.md"];
                const files = await searchFiles(patterns, {
                    cwd,
                    ignoreFilePath: ".textlintignore"
                });
                assert.ok(files.ok);
                assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), []);
            });
        });
    });
    describe("scanFilePath", () => {
        it("should return 'ok' if the path is not ignored", async () => {
            const notIgnoreFilePath = path.resolve(cwd, "dir/test.md");
            const scanResult = await scanFilePath(notIgnoreFilePath, {
                cwd,
                ignoreFilePath: ".textlintignore"
            });
            assert.strictEqual(scanResult.status, "ok");
        });
        it("should return 'ignored' if the path is ignored", async () => {
            const ignoreFilePath = path.resolve(cwd, "ignored/test.md");
            const scanResult = await scanFilePath(ignoreFilePath, {
                cwd,
                ignoreFilePath: ".textlintignore"
            });
            assert.strictEqual(scanResult.status, "ignored");
        });
        it("should return 'ignored' if the path is ignored with absolute ignoreFilePath", async () => {
            const ignoreFilePath = path.resolve(cwd, "ignored/test.md");
            const scanResult = await scanFilePath(ignoreFilePath, {
                cwd,
                ignoreFilePath: path.resolve(cwd, ".textlintignore")
            });
            assert.strictEqual(scanResult.status, "ignored");
        });
        it("should return 'error' if the ignore file is not found", async () => {
            const ignoreFilePath = path.resolve(cwd, "not_found.md");
            const scanResult = await scanFilePath(ignoreFilePath, {
                cwd,
                ignoreFilePath: ".textlintignore"
            });
            assert.strictEqual(scanResult.status, "error");
        });
    });
});
