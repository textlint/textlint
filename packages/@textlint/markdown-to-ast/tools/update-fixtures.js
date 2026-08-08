// MIT © 2017 azu
"use strict";
/*
    Update fixtures/output.json from fixtures/input.md

    input.md -> parse -> output.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Use lib version for fixture generation
import { parse } from "../lib/src/index.js";
const testDir = fileURLToPath(new URL("../test", import.meta.url));
// remark_fixtures to fixtures
const fixtureDir = path.join(testDir, "fixtures");
fs.readdirSync(fixtureDir).forEach(function (filePath) {
    if (filePath.indexOf(".gitkeep") !== -1) {
        return;
    }
    const originalPath = path.join(fixtureDir, filePath);
    const inputFilePath = path.join(originalPath, "input.md");
    try {
        const input = fs.readFileSync(inputFilePath, "utf-8");
        const AST = parse(input);
        const outputJSON = path.join(originalPath, "output.json");
        fs.writeFileSync(outputJSON, JSON.stringify(AST, null, 4), "utf-8");
    } catch (error) {
        console.log("Error: ", inputFilePath);
        throw error;
    }
});
