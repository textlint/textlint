// LICENSE : MIT
"use strict";
import * as assert from "assert";
import * as glob from "glob";
import * as fs from "fs";
import * as path from "path";
import { Config } from "../../src/config/config";
/* load config from "./config/" and match expected result */
describe("config-as-example", function() {
    const configList = glob.sync(path.join(__dirname, "/config-fixtures/**/.textlintrc"));
    configList.forEach(textlintrcPath => {
        const projectDir = path.dirname(textlintrcPath);
        const dirName = projectDir.split("/").pop();
        it(`test config: ${dirName}`, function() {
            let config;
            try {
                config = Config.initWithAutoLoading({
                    textlintrc: true,
                    configFile: textlintrcPath, // == node_modules/
                    rulesBaseDirectory: path.join(__dirname, "config-fixtures", dirName, "modules")
                });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Fail: ${dirName}`);
                throw error;
            }
            const expectedPath = fs.existsSync(path.join(projectDir, "expect.json"))
                ? path.join(projectDir, "expect.json")
                : path.join(projectDir, "expect.js");
            const expect = require(expectedPath);
            const actual = config.toJSON();
            Object.keys(expect).forEach(key => {
                try {
                    assert.deepStrictEqual(actual[key], expect[key]);
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error(`Fail: does not match expected config.
    at ${textlintrcPath}:1:1
    at ${expectedPath}:1:1`);
                    throw error;
                }
            });
        });
    });
});
