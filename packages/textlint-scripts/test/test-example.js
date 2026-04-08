const path = require("path");
const fs = require("node:fs");
const { execSync } = require("child_process");

const exampleDir = path.join(__dirname, "../examples/example");
const exampleTsDir = path.join(__dirname, "../examples/example-ts");
const exampleDynamicImport = path.join(__dirname, "../examples/example-dynamic-import");
const examples = [exampleDir, exampleTsDir, exampleDynamicImport];

const exec = (command, { cwd }) => {
    // eslint-disable-next-line no-console
    console.log(`$ ${command}`);
    try {
        execSync(command, { cwd, stdio: "inherit" });
    } catch {
        process.exit(1);
    }
};

// eslint-disable-next-line no-unused-vars
for (const example of examples) {
    fs.rmSync(path.join(exampleDir, "README.md"), { force: true });
    exec("npm run init-readme", { cwd: exampleDir });
    exec("npm run build", { cwd: exampleDir });
    exec("npm test", { cwd: exampleDir });
}
