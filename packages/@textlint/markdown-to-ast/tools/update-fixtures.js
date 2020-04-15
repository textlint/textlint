// MIT © 2017 azu
"use strict";
/*
    Update fixtures/output.json from fixtures/input.md

    input.md -> parse -> output.json
 */
const fs = require("fs");
const path = require("path");
const parse = require("../lib/markdown-parser").parse;
const testDir = path.join(__dirname, "..", "test");
// remark_fixtures to fixtures
const fixtureDir = path.join(testDir, "fixtures");
fs.readdirSync(fixtureDir).forEach(function (filePath) {
    if (filePath.indexOf(".gitkeep") !== -1) {
        return;
    }
    const originalPath = path.join(fixtureDir, filePath);
    const inputFilePath = path.join(originalPath, "input.md");
    const input = fs.readFileSync(inputFilePath, "utf-8");
    const AST = parse(input);
    const outputJSON = path.join(originalPath, "output.json");
    fs.writeFileSync(outputJSON, JSON.stringify(AST, null, 4), "utf-8");
});
