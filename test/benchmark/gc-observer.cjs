// Record the garbage collections of a process, for compare.mjs.
// Usage: GC_OBSERVER_OUTPUT=<file> node --require ./gc-observer.cjs <script>
// At exit, it writes the number and the total pause of the minor and the major collections as JSON.
"use strict";
const fs = require("node:fs");
const { PerformanceObserver, constants } = require("node:perf_hooks");

const outputFile = process.env.GC_OBSERVER_OUTPUT;
if (outputFile) {
    const stats = {
        minor: { count: 0, time: 0 },
        major: { count: 0, time: 0 }
    };
    const add = (entries) => {
        for (const entry of entries) {
            const kind = entry.detail?.kind ?? entry.kind;
            // a minor collection (scavenge, minor mark-sweep) collects the young generation,
            // and the others (mark-sweep-compact, incremental marking, weak callbacks) the whole heap
            const isMinor =
                kind === constants.NODE_PERFORMANCE_GC_MINOR || kind === constants.NODE_PERFORMANCE_GC_MINOR_MARK_SWEEP;
            const target = isMinor ? stats.minor : stats.major;
            target.count++;
            target.time += entry.duration;
        }
    };
    const observer = new PerformanceObserver((list) => add(list.getEntries()));
    observer.observe({ entryTypes: ["gc"] });
    // Node.js passes an entry to the observer in a later turn of the event loop, so the collections of the last
    // work of the process (such as formatting the results) would be lost. Before a natural exit, wait a few turns once.
    const DRAIN_TURNS = 3;
    process.once("beforeExit", () => {
        let turns = 0;
        const next = () => {
            if (++turns < DRAIN_TURNS) {
                setImmediate(next);
            }
        };
        setImmediate(next);
    });
    process.on("exit", () => {
        // the entries that the observer has not been called with yet
        add(observer.takeRecords());
        fs.writeFileSync(
            outputFile,
            JSON.stringify({
                ...stats,
                total: { count: stats.minor.count + stats.major.count, time: stats.minor.time + stats.major.time }
            })
        );
    });
}
