import * as assert from "assert";
import path from "path";
import { scanFilePath, searchFiles } from "../../src/util/find-util";

// absolute option replaces \ in filename to / #379
// https://github.com/mrmlnc/fast-glob/issues/371
// https://github.com/mrmlnc/fast-glob/issues/379
const bugFixFastGlobInWindows = (filePaths: string[]) => {
    return filePaths.map((filePath) => path.resolve(filePath));
};
const testDir = path.resolve(__dirname, "fixtures/find-util");
const test2Dir = path.resolve(__dirname, "fixtures/(find-util)");
describe("find-util", () => {
    describe("searchFiles", () => {
        it("should find files with relative path pattern", async () => {
            const patterns = ["dir/**/*.md"];
            const files = await searchFiles(patterns, { cwd: testDir });
            assert.ok(files.ok);
            assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                path.resolve(testDir, "dir/ignored.md"),
                path.resolve(testDir, "dir/subdir/test.md"),
                path.resolve(testDir, "dir/test.md")
            ]);
        });
        it("should find files with absolute path pattern", async () => {
            const patterns = ["dir/**/*.md"];
            const files = await searchFiles(patterns, { cwd: testDir });
            assert.ok(files.ok);
            assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                path.resolve(testDir, "dir/ignored.md"),
                path.resolve(testDir, "dir/subdir/test.md"),
                path.resolve(testDir, "dir/test.md")
            ]);
        });
        it("should find dot files", async () => {
            const patterns = ["dir/**/*.md"];
            const files = await searchFiles(patterns, { cwd: testDir });
            assert.ok(files.ok);
            assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                path.resolve(testDir, "dir/ignored.md"),
                path.resolve(testDir, "dir/subdir/test.md"),
                path.resolve(testDir, "dir/test.md")
            ]);
        });
        it("should find files with multiple path patterns", async () => {
            const patterns = ["dir/**/*.md", "ignored/**/*.md"];
            const files = await searchFiles(patterns, { cwd: testDir });
            assert.ok(files.ok);
            assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                path.resolve(testDir, "dir/ignored.md"),
                path.resolve(testDir, "dir/subdir/test.md"),
                path.resolve(testDir, "dir/test.md"),
                path.resolve(testDir, "ignored/subdir/test.md"),
                path.resolve(testDir, "ignored/test.md")
            ]);
        });
        it("should find files with multiple path patterns and ignore patterns in the directory includes ( and )", async () => {
            const patterns = ["dir/**/*.md", "ignored/**/*.md"];
            const files = await searchFiles(patterns, { cwd: test2Dir });
            assert.ok(files.ok);
            assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                path.resolve(test2Dir, "dir/ignored.md"),
                path.resolve(test2Dir, "dir/subdir/test.md"),
                path.resolve(test2Dir, "dir/test.md"),
                path.resolve(test2Dir, "ignored/subdir/test.md"),
                path.resolve(test2Dir, "ignored/test.md")
            ]);
        });
        context("when specify `ignoreFilePath` option", () => {
            it("should find files with relative path patterns", async () => {
                const patterns = ["**/*.md"];
                const files = await searchFiles(patterns, {
                    cwd: testDir,
                    ignoreFilePath: ".textlintignore"
                });
                assert.ok(files.ok);
                assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                    path.resolve(testDir, "dir/subdir/test.md"),
                    path.resolve(testDir, "dir/test.md")
                ]);
            });
            it("should find files with absolute path patterns", async () => {
                const patterns = ["**/*.md"];
                const files = await searchFiles(patterns, {
                    cwd: testDir,
                    ignoreFilePath: ".textlintignore"
                });
                assert.ok(files.ok);
                assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                    path.resolve(testDir, "dir/subdir/test.md"),
                    path.resolve(testDir, "dir/test.md")
                ]);
            });
            // Issue: https://github.com/textlint/textlint/issues/1408
            it("should respect ignore file if pattern is absolute file path", async () => {
                const patterns = ["ignored/test.md"];
                const files = await searchFiles(patterns, {
                    cwd: testDir,
                    ignoreFilePath: ".textlintignore"
                });
                assert.ok(files.ok);
                assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), []);
            });
            it("should respect ignore file in the directory includes ( and )", async () => {
                const patterns = ["dir/**/*.md", "ignored/**/*.md"];
                const files = await searchFiles(patterns, {
                    cwd: test2Dir,
                    ignoreFilePath: ".textlintignore"
                });
                assert.ok(files.ok);
                assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                    path.resolve(test2Dir, "dir/subdir/test.md"),
                    path.resolve(test2Dir, "dir/test.md")
                ]);
            });
            it("should respect ignore file in the directory includes ( and ) if ignoreFilePath is absolute", async () => {
                const patterns = ["**/*.md"];
                const files = await searchFiles(patterns, {
                    cwd: test2Dir,
                    ignoreFilePath: path.resolve(test2Dir, ".textlintignore")
                });
                assert.ok(files.ok);
                assert.deepStrictEqual(bugFixFastGlobInWindows(files.items.sort()), [
                    path.resolve(test2Dir, "README.md"),
                    path.resolve(test2Dir, "dir/subdir/test.md"),
                    path.resolve(test2Dir, "dir/test.md")
                ]);
            });
        });
    });
    describe("scanFilePath", () => {
        it("should return 'ok' if the path is not ignored", async () => {
            const notIgnoreFilePath = path.resolve(testDir, "dir/test.md");
            const scanResult = await scanFilePath(notIgnoreFilePath, {
                cwd: testDir,
                ignoreFilePath: ".textlintignore"
            });
            assert.strictEqual(scanResult.status, "ok");
        });
        it("should return 'ignored' if the path is ignored", async () => {
            const ignoreFilePath = path.resolve(testDir, "ignored/test.md");
            const scanResult = await scanFilePath(ignoreFilePath, {
                cwd: testDir,
                ignoreFilePath: ".textlintignore"
            });
            assert.strictEqual(scanResult.status, "ignored");
        });
        it("should return 'ignored' if the path is ignored with absolute ignoreFilePath", async () => {
            const ignoreFilePath = path.resolve(testDir, "ignored/test.md");
            const scanResult = await scanFilePath(ignoreFilePath, {
                cwd: testDir,
                ignoreFilePath: path.resolve(testDir, ".textlintignore")
            });
            assert.strictEqual(scanResult.status, "ignored");
        });
        it("should return 'error' if the ignore file is not found", async () => {
            const ignoreFilePath = path.resolve(testDir, "not_found.md");
            const scanResult = await scanFilePath(ignoreFilePath, {
                cwd: testDir,
                ignoreFilePath: ".textlintignore"
            });
            assert.strictEqual(scanResult.status, "error");
        });
    });
});
