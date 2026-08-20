// MIT © 2017 azu
"use strict";
/*
    Create fixtures from markdown_fixtures

    markdown_fixtures/some.md -> move to fixtures/{input.md, output.json}
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "../lib/src/index.js";
const testDir = fileURLToPath(new URL("../test", import.meta.url));
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
    fs.mkdirSync(testCaseDir, { recursive: true });
    const testInputFilePath = path.join(fixtureDir, dirName, "input.md");
    fs.renameSync(originalPath, testInputFilePath);
    const input = fs.readFileSync(testInputFilePath, "utf-8");
    const AST = parse(input);
    const outputJSON = path.join(fixtureDir, dirName, "output.json");
    fs.writeFileSync(outputJSON, JSON.stringify(AST), "utf-8");
});
