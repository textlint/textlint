import * as assert from "assert";
import path from "path";
import { findFiles, separateByAvailability } from "../../src/util/find-util";

describe("find-util", () => {
    describe("findFiles", () => {
        const cwd = path.resolve(__dirname, "fixtures/find-util");
        it("should find files with relative path pattern", async () => {
            const patterns = ["dir/**/*.md"];
            const files = await findFiles(patterns, { cwd });
            files.sort();
            assert.deepStrictEqual(files, [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find files with absolute path pattern", async () => {
            const patterns = [path.posix.resolve(cwd, "dir/**/*.md")];
            const files = await findFiles(patterns, { cwd });
            files.sort();
            assert.deepStrictEqual(files, [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find dot files", async () => {
            const patterns = [path.posix.resolve(cwd, "dir/**/*.md")];
            const files = await findFiles(patterns, { cwd });
            files.sort();
            assert.deepStrictEqual(files, [
                path.resolve(cwd, "dir/ignored.md"),
                path.resolve(cwd, "dir/subdir/test.md"),
                path.resolve(cwd, "dir/test.md")
            ]);
        });
        it("should find files with multiple path patterns", async () => {
            const patterns = ["dir/**/*.md", path.posix.resolve(cwd, "ignored/**/*.md")];
            const files = await findFiles(patterns, { cwd });
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
            it("should find files with relative path patterns", async () => {
                const patterns = ["**/*.md"];
                const files = await findFiles(patterns, {
                    cwd,
                    ignoreFilePath: ".textlintignore"
                });
                files.sort();
                assert.deepStrictEqual(files, [
                    path.resolve(cwd, "dir/subdir/test.md"),
                    path.resolve(cwd, "dir/test.md")
                ]);
            });
            it("should find files with absolute path patterns", async () => {
                const patterns = [path.posix.resolve(cwd, "**/*.md")];
                const files = await findFiles(patterns, {
                    cwd,
                    ignoreFilePath: ".textlintignore"
                });
                files.sort();
                assert.deepStrictEqual(files, [
                    path.resolve(cwd, "dir/subdir/test.md"),
                    path.resolve(cwd, "dir/test.md")
                ]);
            });
        });
    });

    describe("separateByAvailability", () => {
        it("should find dot files", () => {
            const files = [".foo"];
            const { availableFiles, unAvailableFiles } = separateByAvailability(files, { extensions: [".foo"] });
            assert.deepStrictEqual(availableFiles, [".foo"]);
            assert.deepStrictEqual(unAvailableFiles, []);
        });
    });
});
