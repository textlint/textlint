import { parse } from "./src/index.js";
import fs from "node:fs";

const input = fs.readFileSync("./test/fixtures/broken-auto-link/input.md", "utf-8");
console.log("Input:", JSON.stringify(input));

const result = parse(input);
console.log("Generated AST:");
console.log(JSON.stringify(result, null, 2));

// 特に、問題のあるStr nodeを確認
function findStrNodes(node, path = "") {
    if (node.type === "Str") {
        console.log(`\nStr node at ${path}:`);
        console.log("  value:", JSON.stringify(node.value));
        console.log("  raw:", JSON.stringify(node.raw));
        console.log("  raw === undefined:", node.raw === undefined);
    }
    
    if (node.children) {
        node.children.forEach((child, i) => {
            findStrNodes(child, `${path}.children[${i}]`);
        });
    }
}

findStrNodes(result, "root");
