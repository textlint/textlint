import fs from "node:fs";
import path from "node:path";
import { parse } from "./src/index";

const fixtureDir = "./test/fixtures";
const inputPath = path.join(fixtureDir, "broken-auto-link", "input.md");
const input = fs.readFileSync(inputPath, "utf-8");

console.log("Input text:");
console.log(JSON.stringify(input));

console.log("\nParsed AST:");
const ast = parse(input);
console.log(JSON.stringify(ast, null, 2));
