// parse all fixture and should has
import assert from "node:assert";
import { describe, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { test as astTest } from "@textlint/ast-tester";
import { parse } from "../src/index";

describe("parsing", function () {
    const fixtureDir = path.join(__dirname, "fixtures");
    fs.readdirSync(fixtureDir).forEach(function (filePath) {
        const dirName = path.basename(filePath);
        it(`${dirName} match AST`, function () {
            const input = fs.readFileSync(path.join(fixtureDir, filePath, "input.md"), "utf-8");
            const AST = parse(input);
            astTest(AST);
            const output = JSON.parse(fs.readFileSync(path.join(fixtureDir, filePath, "output.json"), "utf-8"));
            assert.deepStrictEqual(AST, output);
        });
    });
});
