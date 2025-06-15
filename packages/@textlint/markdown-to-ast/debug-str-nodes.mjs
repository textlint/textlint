import { parse } from "./src/index.ts";

const input = "This is broken: http&#x3A;//example.com/path?key=value#fragment\n";
const ast = parse(input);

console.log("=== AST output ===");
console.log(JSON.stringify(ast, null, 2));

console.log("\n=== Str nodes ===");
const strNodes = [];
function collectStrNodes(node) {
  if (node.type === "Str") {
    strNodes.push(node);
  }
  if (node.children) {
    node.children.forEach(collectStrNodes);
  }
}

collectStrNodes(ast);
strNodes.forEach((strNode, index) => {
  console.log(`Str node ${index}:`, {
    value: strNode.value,
    hasRaw: 'raw' in strNode,
    hasLoc: 'loc' in strNode,
    hasRange: 'range' in strNode,
    hasPosition: 'position' in strNode
  });
});
