#!/usr/bin/env node
"use strict";
var getStdin = require("get-stdin");
var logSymbols = require("log-symbols");
var useStdIn = (process.argv.indexOf("--stdin") > -1);
var isDebug = (process.argv.indexOf("--debug") > -1);
if (isDebug) {
    require("debug").enable("textlint*");
}
// must do this initialization *before* other requires in order to work
var cli = require("../lib/cli");
var setRunningCLI = require("../lib/util/throw-log").setRunningCLI;
// it is for --experimental logger
// update state
setRunningCLI(!module.parent);
/**
 * show error message for user
 * @param {Error} error
 */
function showError(error) {
    console.error(logSymbols.error, "Error");
    console.error(error.message + "\n");
    console.error(logSymbols.error, "Stack trace");
    console.error(error.stack);
}
// Always start as promise
Promise.resolve().then(function() {
    if (useStdIn) {
        return getStdin().then(function(text) {
            return cli.execute(process.argv, text);
        });
    }
    return cli.execute(process.argv);
}).then(function(exitStatus) {
    if (typeof exitStatus === "number") {
        process.exitCode = exitStatus;
    }
}).catch(function(error) {
    showError(error);
    process.exit(error.code || 1);
});

// Catch throw error
process.on("uncaughtException", function(error) {
    showError(error);
    process.exit(1);
});
process.on("unhandledRejection", (error) => {
    showError(error);
    process.exit(1);
});
