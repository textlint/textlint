import * as assert from "assert";
import path from "path";
import { findFiles } from "../../src/util/old-find-util";

describe("old-find-util", () => {
    describe("findFiles", () => {
        const cwd = path.resolve(__dirname, "fixtures/find-util");
        it("should find files with relative path pattern", () => {
            const patterns = ["dir/**/*.md"];
            const files = findFiles(patterns, { cwd });
            files.sort();
            assert.deepStrictEqual(files, [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find files with absolute path pattern", () => {
            const patterns = [path.resolve(cwd, "dir/**/*.md")];
            const files = findFiles(patterns, { cwd });
            files.sort();
            assert.deepStrictEqual(files, [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find dot files", () => {
            const patterns = [path.resolve(cwd, "dir/**/*.md")];
            const files = findFiles(patterns, { cwd });
            files.sort();
            assert.deepStrictEqual(files, [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find files with multiple path patterns", () => {
            const patterns = ["dir/**/*.md", path.resolve(cwd, "ignored/**/*.md")];
            const files = findFiles(patterns, { cwd });
            files.sort();
            assert.deepStrictEqual(files, [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md"),
                path.resolve(cwd, "ignored/subdir/test.md"),
                path.resolve(cwd, "ignored/test.md")
            ]);
        });
        context("when specify `ignoreFilePath` option", () => {
            it("should find files with relative path patterns", () => {
                const patterns = ["**/*.md"];
                const files = findFiles(patterns, {
                    cwd,
                    ignoreFilePath: ".textlintignore"
                });
                files.sort();
                assert.deepStrictEqual(files, [
                    path.resolve(cwd, "dir/subdir/test.md"),
                    path.resolve(cwd, "dir/test.md")
                ]);
            });
            it("should find files with absolute path patterns", () => {
                const patterns = [path.resolve(cwd, "**/*.md")];
                const files = findFiles(patterns, {
                    cwd,
                    ignoreFilePath: ".textlintignore"
                });
                files.sort();
                assert.deepStrictEqual(files, [
                    path.resolve(cwd, "dir/subdir/test.md"),
                    path.resolve(cwd, "dir/test.md")
                ]);
            });
            it("should find files with absolute path patterns in the directory includes ( and )", () => {
                const cwd = path.resolve(__dirname, "fixtures/(find-util)");
                const patterns = [path.resolve(cwd, "**/*.md")];
                const files = findFiles(patterns, {
                    cwd,
                    ignoreFilePath: ".textlintignore"
                });
                files.sort();
                assert.deepStrictEqual(files, [
                    path.resolve(cwd, "README.md"),
                    path.resolve(cwd, "dir/subdir/test.md"),
                    path.resolve(cwd, "dir/test.md")
                ]);
            });
            it("should find files with absolute path patterns in the directory includes ( and ) if ignoreFilePath is absolute", () => {
                const cwd = path.resolve(__dirname, "fixtures/(find-util)");
                const patterns = [path.resolve(cwd, "**/*.md")];
                const files = findFiles(patterns, {
                    cwd,
                    ignoreFilePath: path.resolve(cwd, ".textlintignore")
                });
                files.sort();
                assert.deepStrictEqual(files, [
                    path.resolve(cwd, "README.md"),
                    path.resolve(cwd, "dir/subdir/test.md"),
                    path.resolve(cwd, "dir/test.md")
                ]);
            });
            // Issue: https://github.com/textlint/textlint/issues/1408
            it("[bug] old find-utils does not respect ignore file if pattern is absolute file path", () => {
                const patterns = [path.resolve(cwd, "ignored/test.md")];
                const files = findFiles(patterns, {
                    cwd,
                    ignoreFilePath: ".textlintignore"
                });
                files.sort();
                assert.deepStrictEqual(files, [path.resolve(cwd, "ignored/test.md")]);
            });
        });
    });
});
