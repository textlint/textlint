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

for (const example of examples) {
    fs.rmSync(path.join(example, "README.md"), { force: true });
    exec("npm run init-readme", { cwd: example });
    exec("npm run build", { cwd: example });
    exec("npm test", { cwd: example });
}

// `textlint-scripts test` requires babel-register.
// Adding register-ts (e.g. via `.mocharc.*` for IDE) must not install a second `.ts` hook.
// https://github.com/textlint/textlint/issues/781
exec("npm test -- --require textlint-scripts/register-ts", { cwd: exampleTsDir });
// Reverse order: ts-node first, then Babel (e.g. running `mocha` directly from an IDE)
exec('npx mocha --require textlint-scripts/register-ts --require textlint-scripts/register "test/**/*.ts"', {
    cwd: exampleTsDir
});
