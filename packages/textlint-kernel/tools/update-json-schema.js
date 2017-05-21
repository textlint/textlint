// MIT © 2017 azu
"use strict";
const shell = require("shelljs");
const path = require("path");
shell.pushd(path.join(__dirname, ".."));
shell.exec(`./node_modules/.bin/typescript-json-schema ./tsconfig.json TextlintKernelOptions --out src/TextlintKernelOptions.json`);
shell.popd();
