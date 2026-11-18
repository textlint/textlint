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
