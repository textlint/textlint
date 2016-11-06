// LICENSE : MIT
"use strict";
process.env.NODE_ENV = 'test';
var path = require("path");
var spawn = require("cross-spawn");
var args = process.argv.slice(2);
var mocha = path.resolve(process.cwd(), 'node_modules', '.bin', 'mocha');
// mocha
var child =spawn(mocha, [
    "--compilers", "js:babel-register",
    "--timeout", "5000",
    "--recursive",
    "test/"
].concat(args));
child.stderr.on('data', function(data) {
    process.stderr.write(data);
});
child.stdout.on('data', function(data) {
    process.stdout.write(data);
});
child.on('error', function(error) {
    console.error(error);
});
child.on('exit', function(code) {
    process.exit(code);
});