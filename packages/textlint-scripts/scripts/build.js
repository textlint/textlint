// LICENSE : MIT
"use strict";
// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production';

var path = require("path");
var spawn = require("cross-spawn");
var args = process.argv.slice(3);
var babel = path.resolve(process.cwd(), 'node_modules', '.bin', 'babel');
var configPath = path.resolve(__dirname, "..", "configs", "babelrc.js");
// babel src --out-dir lib --watch --source-maps
spawn.sync(babel, [
    "--config", configPath,
    "--source-maps",
    "--out-dir", "lib",
    "src"
].concat(args), {stdio: "inherit"});