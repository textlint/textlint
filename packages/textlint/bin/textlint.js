#!/usr/bin/env node
"use strict";
const getStdin = require("get-stdin");
const useStdIn = process.argv.indexOf("--stdin") > -1;
const isDebug = process.argv.indexOf("--debug") > -1;
if (isDebug) {
    const debug = require("debug");
    debug.enable("textlint*");
}
// must do this initialization *before* other requires in order to work
const cli = require("../lib/src/cli").cli;
const { coreFlags } = require("@textlint/feature-flag");
// it is for --experimental logger
// update state
coreFlags.runningCLI = !module.parent;

/**
 * show error message for user
 * @param {Error} error
 */
function showError(error) {
    console.error("Error");
    console.error(`${error.message}\n`);
    console.error("Stack trace");
    console.error(error.stack);
}

// Exit Status
// 0: No Error
// - Not found lint error
// - --fix: found errors but fix all errors, so exit with 0
// - --output-file: Found lint error but --output-file is specified
// - --dryRun: Found lint error but --dryRun is specified
// 1: Lint Error
// - found lint error
// - --fix: found errors and could not fix all errors, so exit with 1
// 2: Fatal Error
// Crash textlint process
// Fail to load config/rule/plugin etc...

// Always start as promise
Promise.resolve()
    .then(function () {
        if (useStdIn) {
            return getStdin().then(function (text) {
                return cli.execute(process.argv, text);
            });
        }
        return cli.execute(process.argv);
    })
    .then(function (exitStatus) {
        if (typeof exitStatus === "number") {
            process.exitCode = exitStatus;
        }
    })
    .catch(function (error) {
        showError(error);
        process.exit(2);
    });

// Catch throw error
process.on("uncaughtException", function (error) {
    showError(error);
    process.exit(2);
});
process.on("unhandledRejection", function (error) {
    showError(error);
    process.exit(2);
});
