import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import { loadRawConfig, loadPackagesFromRawConfig } from "../src/index";

const fixturesDir = path.join(__dirname, "snapshots");
const modulesDir = path.join(__dirname, "modules_fixtures");
const replacer = (_key: string, value: any) => {
    if (typeof value === "string") {
        return value.replace(fixturesDir, "<FIXTURES_DIR>").replace(modulesDir, "<MODULES_DIR>");
    }
    if (value instanceof Error) {
        return value.message;
    }
    return value;
};
describe("@textlint/config-loader", () => {
    fs.readdirSync(fixturesDir).map((caseName) => {
        const normalizedTestName = caseName.replace(/-/g, " ");
        it(`Test ${normalizedTestName}`, async function () {
            const fixtureDir = path.join(fixturesDir, caseName);
            const actualFilePath = path.join(fixtureDir, "input.json");
            // const actualContent = JSON.parse(fs.readFileSync(actualFilePath, "utf-8"));
            const configResult = await loadRawConfig({
                configFilePath: actualFilePath,
                node_modulesDir: modulesDir
            });
            assert.ok(configResult.ok);
            const actual = await loadPackagesFromRawConfig({
                rawConfig: configResult.rawConfig,
                node_moduleDir: modulesDir
            });
            const expectedFilePath = path.join(fixtureDir, "output.json");
            // Usage: update snapshots
            // UPDATE_SNAPSHOT=1 npm test
            if (!fs.existsSync(expectedFilePath) || process.env.UPDATE_SNAPSHOT) {
                fs.writeFileSync(expectedFilePath, JSON.stringify(actual, replacer, 4));
                this.skip(); // skip when updating snapshots
                return;
            }
            // compare input and output
            const expectedContent = JSON.parse(fs.readFileSync(expectedFilePath, "utf-8"));
            assert.deepStrictEqual(
                // remove undefined
                JSON.parse(JSON.stringify(actual, replacer)),
                expectedContent
            );
        });
    });
});
