// parse all fixture and should has
import assert from "node:assert";
import { describe, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test as astTest } from "@textlint/ast-tester";
import { parse } from "../src/index.js";

describe("parsing", function () {
    const fixtureDir = fileURLToPath(new URL("fixtures", import.meta.url));
    fs.readdirSync(fixtureDir).forEach(function (filePath) {
        const dirName = path.basename(filePath);
        it(`${dirName} match AST`, function () {
            const input = fs.readFileSync(path.join(fixtureDir, filePath, "input.md"), "utf-8");
            const AST = parse(input);
            astTest(AST as unknown as Record<string, unknown>);
            const output = JSON.parse(fs.readFileSync(path.join(fixtureDir, filePath, "output.json"), "utf-8"));
            assert.deepStrictEqual(AST, output);
        });
    });
});
