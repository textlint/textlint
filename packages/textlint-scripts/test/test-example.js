const path = require("path");
const shell = require("shelljs");

const exampleDir = path.join(__dirname, "../examples/example");
const exampleTsDir = path.join(__dirname, "../examples/example-ts");
const exampleDynamicImport = path.join(__dirname, "../examples/example-dynamic-import");
const examples = [exampleDir, exampleTsDir, exampleDynamicImport];
const exec = (command, { cwd }) => {
    // eslint-disable-next-line no-console
    console.log(`$ ${command}`);
    if (
        shell.exec(command, {
            cwd
        }).code !== 0
    ) {
        shell.exit(1);
    }
};
const cd = (command) => {
    // eslint-disable-next-line no-console
    console.log(`$ ${command}`);
    if (shell.cd(exampleDir).code !== 0) {
        shell.exit(1);
    }
};
for (const example of examples) {
    // example
    cd(exampleDir);
    // installed in monorepo root
    // exec("npm install");
    exec("rm -f ./README.md", {
        cwd: exampleDir
    });
    exec("npm run init-readme", {
        cwd: exampleDir
    });
    exec("npm run build", {
        cwd: exampleDir
    });
    exec("npm test", {
        cwd: exampleDir
    });
}
// exit
shell.exit(0);
