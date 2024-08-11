import * as assert from "assert";
import path from "path";
import { scanFilePath, searchFiles } from "../../src/util/find-util";

const cwd = path.resolve(__dirname, "fixtures/find-util");
describe("find-util", () => {
    describe("searchFiles", () => {
        it("should find files with relative path pattern", async () => {
            const patterns = ["dir/**/*.md"];
            const files = await searchFiles(patterns, { cwd });
            assert.ok(files.ok);
            assert.deepStrictEqual(files.items.sort(), [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find files with absolute path pattern", async () => {
            const patterns = [path.posix.resolve(cwd, "dir/**/*.md")];
            const files = await searchFiles(patterns, { cwd });
            assert.ok(files.ok);
            assert.deepStrictEqual(files.items.sort(), [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find dot files", async () => {
            const patterns = [path.posix.resolve(cwd, "dir/**/*.md")];
            const files = await searchFiles(patterns, { cwd });
            assert.ok(files.ok);
            assert.deepStrictEqual(files.items.sort(), [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find files with multiple path patterns", async () => {
            const patterns = ["dir/**/*.md", path.posix.resolve(cwd, "ignored/**/*.md")];
            const files = await searchFiles(patterns, { cwd });
            assert.ok(files.ok);
            assert.deepStrictEqual(files.items.sort(), [
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
                assert.deepStrictEqual(files.items.sort(), [
                    path.resolve(cwd, "dir/subdir/test.md"),
                    path.resolve(cwd, "dir/test.md")
                ]);
            });
            it("should find files with absolute path patterns", async () => {
                const patterns = [path.posix.resolve(cwd, "**/*.md")];
                const files = await searchFiles(patterns, {
                    cwd,
                    ignoreFilePath: ".textlintignore"
                });
                assert.ok(files.ok);
                assert.deepStrictEqual(files.items.sort(), [
                    path.resolve(cwd, "dir/subdir/test.md"),
                    path.resolve(cwd, "dir/test.md")
                ]);
            });
            // Issue: https://github.com/textlint/textlint/issues/1408
            it("should respect ignore file if pattern is absolute file path", async () => {
                const patterns = [path.posix.resolve(cwd, "ignored/test.md")];
                const files = await searchFiles(patterns, {
                    cwd,
                    ignoreFilePath: ".textlintignore"
                });
                assert.ok(files.ok);
                assert.deepStrictEqual(files.items.sort(), []);
            });
        });
    });
    describe("scanFilePath", () => {
        it("should return false if the path is not ignored", async () => {
            const notIgnoreFilePath = path.resolve(cwd, "dir/test.md");
            const scanResult = await scanFilePath(notIgnoreFilePath, {
                cwd,
                ignoreFilePath: ".textlintignore"
            });
            assert.strictEqual(scanResult.status, "ok");
        });
        it("should return true if the path is ignored", async () => {
            const ignoreFilePath = path.resolve(cwd, "ignored/test.md");
            const scanResult = await scanFilePath(ignoreFilePath, {
                cwd,
                ignoreFilePath: ".textlintignore"
            });
            assert.strictEqual(scanResult.status, "ignored");
        });
        it("should return true??? if the path not found ", async () => {
            const ignoreFilePath = path.resolve(cwd, "not_found.md");
            const scanResult = await scanFilePath(ignoreFilePath, {
                cwd,
                ignoreFilePath: ".textlintignore"
            });
            assert.strictEqual(scanResult.status, "error");
        });
    });
});
