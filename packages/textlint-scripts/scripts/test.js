// LICENSE : MIT
"use strict";
process.env.NODE_ENV = "test";
const spawn = require("cross-spawn");
const fs = require("fs");
const { useTypeScript, useESModules } = require("../configs/conditions.js");
const paths = require("../configs/paths.js");
const args = process.argv.slice(2);
const mocha = require.resolve(".bin/mocha");
// mocha
const babelRegisterPath = require.resolve("../configs/babel-register");
const mochaCommand = [mocha, "--timeout", "10000"]
    .concat(useESModules ? ["--loader", `${/* TODO: babel loader */}`] : ["--require", `"${babelRegisterPath}"`])
    .concat(useTypeScript ? ["--watch-extensions", "ts"] : [])
    .concat(useTypeScript ? [`"test/**/*.{js,ts}"`] : [`"test/**/*.js"`])
    .concat(args)
    .join(" ");
// tsc type-check
const tscCommand = ["tsc", "-p", paths.appTsConfig].join(" ");
const command = useTypeScript ? `${tscCommand} && ${mochaCommand}` : mochaCommand;
const child = spawn(command, {
    shell: true
});
child.stderr.on("data", function(data) {
    process.stderr.write(data);
});
child.stdout.on("data", function(data) {
    process.stdout.write(data);
});
child.on("error", function(error) {
    console.error(error);
});
child.on("close", function(code) {
    process.exit(code);
});
