// MIT © 2017 azu
"use strict";
import { findFiles, pathsToGlobPatterns} from "../../src/util/find-util";
const assert = require("power-assert");
const path = require("path");
const os = require("os");
const sh = require("shelljs");
const fs = require("fs");
let fixtureDir;

/**
 * Replace Windows with posix style paths
 *
 * @param {string} filePath   Path to convert
 * @returns {string}          Converted filepath
 */
function convertPathToPosix(filePath) {
    const normalizedFilePath = path.normalize(filePath);
    return normalizedFilePath.replace(/\\/g, "/");
}
/**
 * Returns the path inside of the fixture directory.
 * @returns {string} The path inside the fixture directory.
 * @private
 */
function getFixturePath() {
    const args = Array.prototype.slice.call(arguments);

    args.unshift(fs.realpathSync(fixtureDir));
    return path.join.apply(path, args);
}

describe("find-util", () => {
    before(() => {
        fixtureDir = `${os.tmpdir()}/textlint/tests/fixtures/`;
        sh.mkdir("-p", fixtureDir);
        sh.cp("-r", path.join(__dirname, "/fixtures/*"), fixtureDir);
    });

    after(() => {
        sh.rm("-r", fixtureDir);
    });

    describe("resolveFileGlobPatterns()", () => {
        it("should not convert a glob pattern", () => {
            const patterns = ["*"];
            const opts = {
                cwd: getFixturePath("find-util")
            };
            const result = pathsToGlobPatterns(patterns, opts);

            assert.deepEqual(result, ["*"]);
        });

        it("should convert a directory name with no provided extensions into a glob pattern", () => {
            const patterns = ["one-js-file"];
            const opts = {
                cwd: getFixturePath("find-util")
            };
            const result = pathsToGlobPatterns(patterns, opts);

            assert.deepEqual(result, ["one-js-file/**/*"]);
        });

        it("should convert an absolute directory name with no provided extensions into a posix glob pattern", () => {
            const patterns = [getFixturePath("find-util", "one-js-file")];
            const opts = {
                cwd: getFixturePath("find-util")
            };
            const result = pathsToGlobPatterns(patterns, opts);
            const expected = [`${getFixturePath("find-util", "one-js-file").replace(/\\/g, "/")}/**/*`];

            assert.deepEqual(result, expected);
        });

        it("should convert a directory name with a single provided extension into a glob pattern", () => {
            const patterns = ["one-js-file"];
            const opts = {
                cwd: getFixturePath("find-util"),
                extensions: [".jsx"]
            };
            const result = pathsToGlobPatterns(patterns, opts);

            assert.deepEqual(result, ["one-js-file/**/*.jsx"]);
        });

        it("should convert a directory name with multiple provided extensions into a glob pattern", () => {
            const patterns = ["one-js-file"];
            const opts = {
                cwd: getFixturePath("find-util"),
                extensions: [".jsx", ".js"]
            };
            const result = pathsToGlobPatterns(patterns, opts);

            assert.deepEqual(result, ["one-js-file/**/*.{jsx,js}"]);
        });

        it("should convert multiple directory names into glob patterns", () => {
            const patterns = ["one-js-file", "two-js-files"];
            const opts = {
                cwd: getFixturePath("find-util")
            };
            const result = pathsToGlobPatterns(patterns, opts);

            assert.deepEqual(result, ["one-js-file/**/*", "two-js-files/**/*"]);
        });

        it("should remove leading './' from glob patterns", () => {
            const patterns = ["./one-js-file"];
            const opts = {
                cwd: getFixturePath("find-util")
            };
            const result = pathsToGlobPatterns(patterns, opts);

            assert.deepEqual(result, ["one-js-file/**/*"]);
        });

        it("should convert a directory name with a trailing '/' into a glob pattern", () => {
            const patterns = ["one-js-file/"];
            const opts = {
                cwd: getFixturePath("find-util")
            };
            const result = pathsToGlobPatterns(patterns, opts);

            assert.deepEqual(result, ["one-js-file/**/*"]);
        });

        it("should return filenames as they are", () => {
            const patterns = ["some-file.js"];
            const opts = {
                cwd: getFixturePath("find-util")
            };
            const result = pathsToGlobPatterns(patterns, opts);

            assert.deepEqual(result, ["some-file.js"]);
        });

        it("should convert backslashes into forward slashes", () => {
            const patterns = ["one-js-file\\example.js"];
            const opts = {
                cwd: getFixturePath()
            };
            const result = pathsToGlobPatterns(patterns, opts);

            assert.deepEqual(result, ["one-js-file/example.js"]);
        });
    });

    describe("listFilesToProcess()", () => {

        it("should return an array with a resolved (absolute) filename", () => {
            const patterns = [getFixturePath("find-util", "one-js-file", "**/*.js")];
            const result = findFiles(patterns, {
                cwd: getFixturePath()
            });

            const file1 = getFixturePath("find-util", "one-js-file", "baz.js");

            assert(Array.isArray(result));
            assert.deepEqual(result, [
                convertPathToPosix(file1)
            ]);
        });

        it("should return all files matching a glob pattern", () => {
            const patterns = [getFixturePath("find-util", "two-js-files", "**/*.js")];
            const result = findFiles(patterns, {
                cwd: getFixturePath()
            });

            const file1 = getFixturePath("find-util", "two-js-files", "bar.js");
            const file2 = getFixturePath("find-util", "two-js-files", "foo.js");

            assert.equal(result.length, 2);
            assert.deepEqual(result, [
                convertPathToPosix(file1),
                convertPathToPosix(file2)
            ]);
        });

        it("should return all files matching multiple glob patterns", () => {
            const patterns = [
                getFixturePath("find-util", "two-js-files", "**/*.js"),
                getFixturePath("find-util", "one-js-file", "**/*.js")
            ];
            const result = findFiles(patterns, {
                cwd: getFixturePath()
            });

            const file1 = getFixturePath("find-util", "two-js-files", "bar.js");
            const file2 = getFixturePath("find-util", "two-js-files", "foo.js");
            const file3 = getFixturePath("find-util", "one-js-file", "baz.js");

            assert.equal(result.length, 3);
            assert.deepEqual(result, [
                convertPathToPosix(file1),
                convertPathToPosix(file2),
                convertPathToPosix(file3),
            ]);
        });

        it("should not return hidden files for standard glob patterns", () => {
            const patterns = [getFixturePath("find-util", "hidden", "**/*.js")];
            const result = findFiles(patterns, {
                cwd: getFixturePath()
            });

            assert.equal(result.length, 0);
        });

        it("should return hidden files if included in glob pattern", () => {
            const patterns = [getFixturePath("find-util", "hidden", "**/.*.js")];
            const result = findFiles(patterns, {
                cwd: getFixturePath()
            });

            const file1 = getFixturePath("find-util", "hidden", ".foo.js");

            assert.equal(result.length, 1);
            assert.deepEqual(result, [
                convertPathToPosix(file1)
            ]);
        });

        it("should ignore and warn for default ignored files when passed explicitly", () => {
            const filename = getFixturePath("find-util", "hidden", ".foo.js");
            const patterns = [filename];
            const result = findFiles(patterns, {
                cwd: getFixturePath()
            });

            assert.equal(result.length, 1);
            assert.deepEqual(result[0], filename);
        });

        it("should not ignore default ignored files when passed explicitly if ignore is false", () => {
            const filename = getFixturePath("find-util", "hidden", ".foo.js");
            const patterns = [filename];
            const result = findFiles(patterns, {
                cwd: getFixturePath(),
                ignore: false
            });

            assert.equal(result.length, 1);
            assert.deepEqual(result[0], filename);
        });

        it("should not return a file which does not exist", () => {
            const patterns = ["tests/fixtures/find-util/hidden/bar.js"];
            const result = findFiles(patterns);

            assert.equal(result.length, 0);
        });

        it("should not return an ignored file", () => {

            // Relying here on the .eslintignore from the repo root
            const patterns = ["tests/fixtures/find-util/ignored/**/*"];
            const result = findFiles(patterns);

            assert.equal(result.length, 0);
        });

        it("should return an ignored file, if ignore option is turned off", () => {
            const options = {ignore: false};
            const patterns = [getFixturePath("find-util", "ignored", "**/*.js")];
            const result = findFiles(patterns, options);

            assert.equal(result.length, 1);
        });

        it("should return a file only once if listed in more than 1 pattern", () => {
            const patterns = [
                getFixturePath("find-util", "one-js-file", "**/*.js"),
                getFixturePath("find-util", "one-js-file", "baz.js")
            ];
            const result = findFiles(patterns, {
                cwd: path.join(fixtureDir, "..")
            });

            const file1 = getFixturePath("find-util", "one-js-file", "baz.js");

            assert(Array.isArray(result));
            assert.deepEqual(result, [
                convertPathToPosix(file1)
            ]);
        });

    });
});
