/* eslint-disable no-console,no-process-exit */
// LICENSE : MIT
"use strict";
process.env.NODE_ENV = "test";
const spawn = require("cross-spawn");
const args = process.argv.slice(2);
const mocha = require.resolve(".bin/mocha");
// mocha
const babelRegisterPath = require.resolve("../configs/babel-register");
const child = spawn(mocha, [
    "--require", babelRegisterPath,
    "--timeout", "5000",
    "--recursive",
    "test/"
].concat(args));

child.stderr.on("data", function(data) {
    process.stderr.write(data);
});
child.stdout.on("data", function(data) {
    process.stdout.write(data);
});
child.on("error", function(error) {
    console.error(error);
});
child.on("exit", function(code) {
    process.exit(code);
});
