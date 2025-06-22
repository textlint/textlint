import * as assert from "node:assert";
import { describe, it } from "vitest";
import path from "node:path";
import { findFiles } from "../../src/util/old-find-util.js";

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
            const patterns = ["dir/**/*.md"];
            const files = findFiles(patterns, { cwd });
            files.sort();
            assert.deepStrictEqual(files, [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find dot files", () => {
            const patterns = ["dir/**/*.md"];
            const files = findFiles(patterns, { cwd });
            files.sort();
            assert.deepStrictEqual(files, [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find files with multiple path patterns", () => {
            const patterns = ["dir/**/*.md", "ignored/**/*.md"];
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
        describe("when specify `ignoreFilePath` option", () => {
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
            it("should find files with absolute path patterns in the directory includes ( and )", () => {
                const cwd = path.resolve(__dirname, "fixtures/(find-util)");
                const patterns = ["**/*.md"];
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
                const patterns = ["**/*.md"];
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
