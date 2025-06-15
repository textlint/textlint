const fs = require("fs");
const path = require("path");
const parse = require("./lib/src/index.js").parse;

const input = fs.readFileSync(path.join(__dirname, "test/fixtures/broken-auto-link/input.md"), "utf-8");
console.log("Input:", JSON.stringify(input));

const AST = parse(input);
console.log("Generated AST:");
console.log(JSON.stringify(AST, null, 2));

const expected = JSON.parse(
    fs.readFileSync(path.join(__dirname, "test/fixtures/broken-auto-link/output.json"), "utf-8")
);
console.log("\nExpected AST:");
console.log(JSON.stringify(expected, null, 2));

// Find nodes without raw property
function findNodesWithoutRaw(node) {
    const nodes = [];

    function traverse(node) {
        if (node && typeof node === "object") {
            if (node.type && !node.raw) {
                nodes.push(node);
            }

            if (Array.isArray(node)) {
                node.forEach(traverse);
            } else {
                Object.values(node).forEach(traverse);
            }
        }
    }

    traverse(node);
    return nodes;
}

const nodesWithoutRaw = findNodesWithoutRaw(AST);
console.log("\nNodes without raw property:");
console.log(JSON.stringify(nodesWithoutRaw, null, 2));
