#!/usr/bin/env node
"use strict";
var concat = require("concat-stream");
var useStdIn = (process.argv.indexOf("--stdin") > -1);
var isDebug = (process.argv.indexOf("--debug") > -1);
if (isDebug) {
    require("debug").enable("textlint*");
}
// must do this initialization *before* other requires in order to work
var cli = require("../lib/cli");
var setRunningCLI = require("../lib/util/throw-log").setRunningCLI;
var exitCode = 0;

// it is for --experimental logger
// update state
setRunningCLI(!module.parent);

if (useStdIn) {
    process.stdin.pipe(concat({encoding: "string"}, function (text) {
        cli.execute(process.argv, text).then(function (code) {
            exitCode = code;
            process.exit(exitCode);
        });
    }));
} else {
    cli.execute(process.argv).then(function (code) {
        exitCode = code;
        process.exit(exitCode);
    });
}

/*
 * Wait for the stdout buffer to drain.
 * See https://github.com/eslint/eslint/issues/317
 */
process.on("exit", function () {
    process.exit(exitCode);
});
