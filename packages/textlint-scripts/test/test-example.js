const path = require("path");
const shell = require("shelljs");

const exampleDir = path.join(__dirname, "../example");
const exampleTsDir = path.join(__dirname, "../example-ts");

const exec = (command) => {
    console.log(command);
    if (shell.exec(command).code !== 0) {
        shell.exit(1);
    }
};
const cd = (command) => {
    console.log(command);
    if (shell.cd(exampleDir).code !== 0) {
        shell.exit(1);
    }
};
// example
cd(exampleDir);
exec("npm install");
exec("npm test");
exec("npm run build");
// example-ts
cd(exampleTsDir);
exec("npm install");
exec("npm test");
exec("npm run build");

// exit
shell.exit(0);
