// LICENSE : MIT
"use strict";
const os = require("node:os");
const { exec } = require("node:child_process");
/*
 * A little bit fuzzy. My computer has a first CPU speed of 3093 and the perf test
 * always completes in < 2000ms. However, Travis is less predictable due to
 * multiple different VM types. So I'm fudging this for now in the hopes that it
 * at least provides some sort of useful signal.
 */
const PERF_MULTIPLIER = 7.5e6;
/**
 * Calculates the time for each run for performance
 * @param {string} cmd cmd
 * @param {int} runs Total number of runs to do
 * @param {int} runNumber Current run number
 * @param {int[]} results Collection results from each run
 * @param {function} cb Function to call when everything is done
 * @returns {int[]} calls the cb with all the results
 * @private
 */
function time(cmd, runs, runNumber, results, cb) {
    const start = process.hrtime();
    exec(cmd, function () {
        const diff = process.hrtime(start),
            actual = diff[0] * 1e3 + diff[1] / 1e6; // ms

        results.push(actual);
        console.log(`Performance Run #${runNumber}:  %dms`, actual);
        if (runs > 1) {
            time(cmd, runs - 1, runNumber + 1, results, cb);
        } else {
            return cb(results);
        }
    });
}

function run() {
    const cpuSpeed = os.cpus()[0].speed;
    const max = PERF_MULTIPLIER / cpuSpeed;
    const TEXTLINT = `node ${__dirname}/node_modules/.bin/textlint`;
    const target = `${__dirname}/md/`;
    const cmd = `${TEXTLINT} ${target}`;
    time(cmd, 5, 1, [], function (results) {
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
