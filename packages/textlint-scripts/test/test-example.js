const test = require("node:test");
const path = require("path");
const shell = require("shelljs");

const exampleDir = path.join(__dirname, "../examples/example");
const exampleTsDir = path.join(__dirname, "../examples/example-ts");
const exampleDynamicImport = path.join(__dirname, "../examples/example-dynamic-import");
const examples = [exampleDir, exampleTsDir, exampleDynamicImport];

const exec = (command, { cwd }) => {
    console.log(`$ ${command}`);
    const result = shell.exec(command, { cwd });
    if (result.code !== 0) {
        throw new Error(`Command failed: ${command}\n${result.stderr}`);
    }
    return result;
};

const cd = (dir) => {
    console.log(`$ cd ${dir}`);
    const result = shell.cd(dir);
    if (result.code !== 0) {
        throw new Error(`Failed to change directory to: ${dir}`);
    }
    return result;
};

test("textlint-scripts examples", async (t) => {
    for (const example of examples) {
        await t.test(`example: ${path.basename(example)}`, async () => {
            // Change to example directory
            cd(example);

            // Clean up README.md
            exec("rm -f ./README.md", { cwd: example });

            // Initialize README
            exec("npm run init-readme", { cwd: example });

            // Build the project
            exec("npm run build", { cwd: example });

            // Run tests
            exec("npm test", { cwd: example });
        });
    }
});
