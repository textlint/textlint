import * as fs from "node:fs";
import { describe, it, expect } from "vitest";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import * as assert from "node:assert";
import { TextlintKernelOptions } from "../src/textlint-kernel-interface.js";
import { TextlintKernel } from "../src/index.js";

// Use a relative path for test files in vitest
const SNAPSHOTS_DIRECTORY = path.resolve(__dirname, "snapshots");
// normalize based on the OS
const normalizePath = (value: string) => {
    return path.sep === "\\" ? value.replace(/\\/g, "/") : value;
};
const pathReplacer = (dirPath: string) => {
    return function replacer(key: string, value: any) {
        if (key === "filePath") {
            return normalizePath(value.replace(dirPath, "<root>"));
        }
        return value;
    };
};
const normalizeJSON = (o: object, rootDir: string) => {
    return JSON.parse(JSON.stringify(o, pathReplacer(rootDir)));
};

describe("textlint-kernel-snapshots", () => {
    fs.readdirSync(SNAPSHOTS_DIRECTORY).forEach((caseName) => {
        const normalizedTestName = caseName.replace(/-/g, " ");
        it(`Test ${normalizedTestName}`, async function () {
            const fixtureDir = path.join(SNAPSHOTS_DIRECTORY, caseName);
            const actualFilePath = path.join(fixtureDir, "input.md");
            const actualContent = fs.readFileSync(actualFilePath, "utf-8");
            const actualOptionFilePath = path.join(fixtureDir, "options.ts");
            // Use dynamic import for TypeScript files
            const actualOptionsModule = await import(pathToFileURL(actualOptionFilePath).href);
            const actualOptions: TextlintKernelOptions = actualOptionsModule.options;
            const kernel = new TextlintKernel();
            const actualResults = normalizeJSON(
                await kernel.lintText(actualContent, actualOptions),
                SNAPSHOTS_DIRECTORY
            );
            const expectedFilePath = path.join(fixtureDir, "output.json");
            // Usage: update snapshots
            // UPDATE_SNAPSHOT=1 npm test
            if (!fs.existsSync(expectedFilePath) || process.env.UPDATE_SNAPSHOT) {
                fs.writeFileSync(expectedFilePath, JSON.stringify(actualResults, null, 4));
                return; // skip when updating snapshots
            }
            // compare input and output
            const expectedContent = JSON.parse(fs.readFileSync(expectedFilePath, "utf-8"));
            assert.deepStrictEqual(actualResults, expectedContent);
        });
    });
});
