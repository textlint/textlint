// LICENSE : MIT
"use strict";
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");
/*
 * A little bit fuzzy. My computer has a first CPU speed of 3093 and the perf test
 * always completes in < 2000ms. However, Travis is less predictable due to
 * multiple different VM types. So I'm fudging this for now in the hopes that it
 * at least provides some sort of useful signal.
 */
const PERF_MULTIPLIER = 7.5e6;
/**
 * Calculates the time for each run for performance
 * @param {string} file executable to run
 * @param {string[]} args arguments to pass to the executable
 * @param {int} runs Total number of runs to do
 * @param {int} runNumber Current run number
 * @param {int[]} results Collection results from each run
 * @param {function} cb Function to call when everything is done
 * @returns {int[]} calls the cb with all the results
 * @private
 */
function time(file, args, runs, runNumber, results, cb) {
    const start = process.hrtime();
    // textlint exits with a non-zero code when lint errors are found; this perf
    // test only measures execution time, so the exit code is intentionally ignored.
    execFile(file, args, function (error, _stdout, stderr) {
        // exit code 1 means lint errors are found. Other errors mean that textlint is crashed.
        if (error && error.code !== 1) {
            console.error(stderr || error);
            process.exitCode = 2;
            return;
        }
        const diff = process.hrtime(start),
            actual = diff[0] * 1e3 + diff[1] / 1e6; // ms

        results.push(actual);
        console.log(`Performance Run #${runNumber}:  %dms`, actual);
        if (runs > 1) {
            time(file, args, runs - 1, runNumber + 1, results, cb);
        } else {
            return cb(results);
        }
    });
}

function run() {
    const cpuSpeed = os.cpus()[0].speed;
    const max = PERF_MULTIPLIER / cpuSpeed;
    // node_modules/.bin/textlint can be a shell script (e.g. pnpm), so run the JavaScript file directly
    const textlintBin = require.resolve("textlint/bin/textlint.js");
    // textlint resolves rules from its own location by default, so load rules from this example's node_modules
    const rulesBaseDirectory = path.join(__dirname, "node_modules");
    const target = path.join(__dirname, "md");
    time("node", [textlintBin, "--rules-base-directory", rulesBaseDirectory, target], 5, 1, [], function (results) {
        results.sort(function (a, b) {
            return a - b;
        });

        const median = results[~~(results.length / 2)];

        if (median > max) {
            console.log("Performance budget exceeded: %dms (limit: %dms)", median, max);
        } else {
            console.log("Performance budget ok:  %dms (limit: %dms)", median, max);
        }
    });
}
run();
