import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import { loadRawConfig, loadPackagesFromRawConfig } from "../src/index";

const fixturesDir = path.join(__dirname, "snapshots");
const modulesDir = path.join(__dirname, "modules_fixtures");
const replacer = (key: string, value: any) => {
    // `moduleName` and `filePath` is a file path
    if ((key === "moduleName" || key === "filePath") && typeof value === "string") {
        return (
            value
                // replace absolute path
                .replace(fixturesDir, "<FIXTURES_DIR>")
                .replace(modulesDir, "<MODULES_DIR>")
                // normalize path
                .replace(/\\/g, "/")
        );
    }
    if (value instanceof Error) {
        return value.message;
    }
    return value;
};

// 配列を決定論的な順序でソートするヘルパー関数
const sortConfigForComparison = (config: any): any => {
    if (Array.isArray(config)) {
        return config.map(sortConfigForComparison).sort((a, b) => {
            // 文字列の場合はそのまま比較
            if (typeof a === "string" && typeof b === "string") {
                return a.localeCompare(b);
            }
            // ruleIdで最初にソート
            if (a.ruleId && b.ruleId) {
                return a.ruleId.localeCompare(b.ruleId);
            }
            // pluginIdでソート
            if (a.pluginId && b.pluginId) {
                return a.pluginId.localeCompare(b.pluginId);
            }
            // typeでソート
            if (a.type && b.type) {
                return a.type.localeCompare(b.type);
            }
            return 0;
        });
    } else if (config && typeof config === "object") {
        const sorted: any = {};
        Object.keys(config)
            .sort()
            .forEach((key) => {
                sorted[key] = sortConfigForComparison(config[key]);
            });
        return sorted;
    }
    return config;
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
                const processedActual = JSON.parse(JSON.stringify(actual, replacer));
                const sortedActual = sortConfigForComparison(processedActual);
                fs.writeFileSync(expectedFilePath, JSON.stringify(sortedActual, null, 4));
                this.skip(); // skip when updating snapshots
                return;
            }
            // compare input and output
            const expectedContent = JSON.parse(fs.readFileSync(expectedFilePath, "utf-8"));
            const processedActual = JSON.parse(JSON.stringify(actual, replacer));
            const actualForComparison = sortConfigForComparison(processedActual);
            const expectedForComparison = sortConfigForComparison(expectedContent);
            assert.deepStrictEqual(actualForComparison, expectedForComparison);
        });
    });
    context("when config file is not encoded in UTF-8", () => {
        it("should validate UTF-8 encoding and reject non-UTF-8 files", () => {
            const notUTF8Files = ["shift-jis.json", "euc-jp.json"];
            notUTF8Files.forEach(async (notUTF8File) => {
                const configFile = path.join(__dirname, "fixtures", notUTF8File);
                const result = await loadRawConfig({
                    configFilePath: configFile,
                    node_modulesDir: modulesDir
                });
                assert.strictEqual(result.ok, false, "Result should be not ok for non-UTF-8 file");

                if (!result.ok) {
                    assert.strictEqual(
                        result.error.message,
                        "textlint configuration file must be encoded in UTF-8",
                        "Error message should indicate UTF-8 encoding issue"
                    );

                    const errorDetail = result.error.errors[0].message;
                    assert.match(errorDetail, /UTF-8/, "Error details should mention UTF-8 encoding");
                }
            });
        });
    });
});
