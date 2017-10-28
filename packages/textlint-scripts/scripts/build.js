// LICENSE : MIT
"use strict";
// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = "production";

var spawn = require("cross-spawn");
var args = process.argv.slice(2);
var babel = require.resolve(".bin/babel");
var babelrc = require("../configs/babelrc");
// babel src --out-dir lib --watch --source-maps
var child = spawn(
    babel,
    ["--presets", babelrc.presets.join(","), "--source-maps", "--out-dir", "lib", "src"].concat(args)
);
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
