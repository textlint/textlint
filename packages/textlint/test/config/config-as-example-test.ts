// LICENSE : MIT
"use strict";
import * as assert from "node:assert";
import { describe, it } from "vitest";
import * as glob from "glob";
import * as fs from "node:fs";
import * as path from "node:path";
import { Config } from "../../src/DEPRECATED/config.js";
import { moduleInterop } from "@textlint/module-interop";
/* load config from "./config/" and match expected result */
describe("config-as-example", function () {
    const configList = glob.sync(path.join(__dirname, "/config-fixtures/*/{.textlintrc,package.json}"));
    configList.forEach((textlintrcPath) => {
        const projectDir = path.dirname(textlintrcPath);
        const matchedFileName = path.basename(textlintrcPath);
        const dirName = projectDir.split("/").pop();
        it(`test config: ${dirName}`, function () {
            assert.ok(dirName != undefined);
            let config;
            try {
                config = Config.initWithAutoLoading({
                    textlintrc: true,
                    // if the directory has .textlintrc, use it.
                    // if the directory has package.json, load `{cwd}/package.json`
                    configFile: matchedFileName === "package.json" ? "textlint" : textlintrcPath,
                    cwd: projectDir,
                    rulesBaseDirectory: path.join(__dirname, "config-fixtures", dirName, "modules")
                });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Fail: ${dirName}`);
                throw error;
            }
            const expectedPath = fs.existsSync(path.join(projectDir, "expect.json"))
                ? path.join(projectDir, "expect.json")
                : path.join(projectDir, "expect.ts");
            const expect =
                expectedPath.split(".").pop() == "json" ? require(expectedPath) : moduleInterop(require(expectedPath));
            const actual = config.toJSON();
            Object.keys(expect).forEach((key) => {
                try {
                    assert.deepStrictEqual(actual[key], expect[key]);
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error(`Fail: "${key}" values does not match expected config.
    at ${textlintrcPath}:1:1
    at ${expectedPath}:1:1`);
                    throw error;
                }
            });
        });
    });
});
