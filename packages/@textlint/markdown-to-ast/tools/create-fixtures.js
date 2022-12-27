// MIT © 2017 azu
"use strict";
/*
    Create fixtures from markdown_fixtures

    markdown_fixtures/some.md -> move to fixtures/{input.md, output.json}
 */
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const parse = require("../lib/src/index").parse;
const testDir = path.join(__dirname, "..", "test");
// remark_fixtures to fixtures
const remarkFixtures = path.join(testDir, "markdown_fixtures");
const fixtureDir = path.join(testDir, "fixtures");
fs.readdirSync(remarkFixtures).forEach(function (filePath) {
    if (filePath.indexOf(".gitkeep") !== -1) {
        return;
    }
    const originalPath = path.join(remarkFixtures, filePath);
    const dirName = path.basename(filePath);
    const testCaseDir = path.join(fixtureDir, dirName);
    mkdirp.sync(testCaseDir);
    const testInputFilePath = path.join(fixtureDir, dirName, "input.md");
    fs.renameSync(originalPath, testInputFilePath);
    const input = fs.readFileSync(testInputFilePath, "utf-8");
    const AST = parse(input);
    const outputJSON = path.join(fixtureDir, dirName, "output.json");
    fs.writeFileSync(outputJSON, JSON.stringify(AST), "utf-8");
});
