#!/usr/bin/env node
"use strict";
var concat = require("concat-stream"),
    cli = require("../lib/cli");

var exitCode = 0,
    useStdIn = (process.argv.indexOf("--stdin") > -1);

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
