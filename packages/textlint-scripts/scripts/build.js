// LICENSE : MIT
"use strict";
// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = "production";
const fs = require("fs");
const spawn = require("cross-spawn");
const paths = require("../configs/paths");
const args = process.argv.slice(2);
const babel = require.resolve(".bin/babel");
const babelConfigFilePath = require.resolve("../configs/babel.config");

const useTypeScript = fs.existsSync(paths.appTsConfig);
// babel src --out-dir lib --watch --source-maps
const babelCommand = [babel, "--config-file", `"${babelConfigFilePath}"`, "--source-maps", "--out-dir", "lib", "src"]
    .concat(useTypeScript ? ["--extensions", ".ts"] : [])
    .concat(args)
    .join(" ");
// tsc type-check
const tscCommand = ["tsc", "-p", paths.appTsConfig].join(" ");

const command = useTypeScript ? `${tscCommand} && ${babelCommand}` : babelCommand;
const child = spawn(command, {
    shell: true
});
child.stderr.pipe(process.stderr);
child.stdout.pipe(process.stdout);
child.on("error", function(error) {
    console.error(error);
});
child.on("close", function(code) {
    process.exit(code);
});
