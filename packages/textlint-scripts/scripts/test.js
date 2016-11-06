// LICENSE : MIT
"use strict";
process.env.NODE_ENV = 'test';
var path = require("path");
var spawn = require("cross-spawn");
var args = process.argv.slice(3);
var mocha = path.resolve(process.cwd(), 'node_modules', '.bin', 'mocha');
// mocha
spawn.sync(mocha, [
    "--compilers", "js:babel-register",
    "--timeout", "5000",
    "--recursive",
    "test/"
].concat(args), {stdio: "inherit"});