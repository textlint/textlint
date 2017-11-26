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
                    configFile: textlintrcPath, // == node_modules/
                    rulesBaseDirectory: path.join(__dirname, "config-fixtures", dirName, "modules")
                });
            } catch (error) {
                console.error(`Fail: ${dirName}`);
                throw error;
            }
            const expect = fs.existsSync(path.join(projectDir, "expect.json"))
                ? require(path.join(projectDir, "expect.json"))
                : require(path.join(projectDir, "expect.js"));
            const actual = config.toJSON();
            Object.keys(expect).forEach(key => {
                assert.deepEqual(actual[key], expect[key]);
            });
        });
    });
});
