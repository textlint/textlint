import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import { TextlintKernelOptions } from "../src/textlint-kernel-interface";
import { TextlintKernel } from "../src";

const SNAPSHOTS_DIRECTORY = path.join(__dirname, "snapshots");
const pathReplacer = (dirPath: string) => {
    return function replacer(key: string, value: any) {
        if (key === "filePath") {
            return value.replace(dirPath, "<root>");
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
            const actualOptions: TextlintKernelOptions = await import(actualOptionFilePath).then((m) => m.options);
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
                this.skip(); // skip when updating snapshots
                return;
            }
            // compare input and output
            const expectedContent = JSON.parse(fs.readFileSync(expectedFilePath, "utf-8"));
            assert.deepStrictEqual(actualResults, expectedContent);
        });
    });
});
