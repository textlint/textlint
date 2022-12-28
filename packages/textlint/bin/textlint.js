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
const cliOld = require("../lib/src/cli").cli;
const cliNew = require("../lib/src/cli-new").cli;
const cli = process.env.TEXTLINT_USE_NEW_CLI ? cliNew : cliOld;
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
        process.exit(1);
    });

// Catch throw error
process.on("uncaughtException", function (error) {
    showError(error);
    process.exit(1);
});
process.on("unhandledRejection", function (error) {
    showError(error);
    process.exit(1);
});
