/**
 * @fileoverview Tracks performance of individual rules.
 * @author Brandon Mills
 * @copyright 2014 Brandon Mills. All rights reserved.
 */
"use strict";
import Logger from "./logger.js";

/* istanbul ignore next */
/**
 * Align the string to left
 * @param {string} str string to evaluate
 * @param {int} len length of the string
 * @param {string} [ch] delimiter character
 * @returns {string} modified string
 * @private
 */
function alignLeft(str: string, len: number, ch?: string) {
    return str + new Array(len - str.length + 1).join(ch || " ");
}

/* istanbul ignore next */
/**
 * Align the string to right
 * @param {string} str string to evaluate
 * @param {int} len length of the string
 * @param {string} [ch] delimiter character
 * @returns {string} modified string
 * @private
 */
function alignRight(str: string, len: number, ch?: string) {
    return new Array(len - str.length + 1).join(ch || " ") + str;
}

const isBrowser = typeof process === "undefined";
const enabled = isBrowser ? false : Boolean(process.env.TIMING);

const HEADERS = ["Rule", "Time (ms)", "Relative"];
const ALIGN = [alignLeft, alignRight, alignRight];

/* istanbul ignore next */
/**
 * display the data
 * @param {object} data Data object to be displayed
 * @returns {string} modified string
 * @private
 */
function display(data: Record<string, number>) {
    let total = 0;
    const sortedData = Object.keys(data)
        .map(function (key) {
            const time = data[key];
            total += time;
            return [key, time] as [string, number];
        })
        .sort(function (a: [string, number], b: [string, number]) {
            return b[1] - a[1];
        })
        .slice(0, 10);

    const rows: (string | number)[][] = [...sortedData];

    rows.forEach(function (row: (string | number)[]) {
        const time = row[1] as number;
        row.push(`${((time * 100) / total).toFixed(1)}%`);
        row[1] = time.toFixed(3);
    });

    rows.unshift(HEADERS as (string | number)[]);

    const widths: Array<number> = [];
    rows.forEach(function (row) {
        for (let i = 0; i < row.length; i++) {
            const n = String(row[i]).length;
            if (!widths[i] || n > widths[i]) {
                widths[i] = n;
            }
        }
    });

    const table = rows.map(function (row) {
        return row
            .map(function (cell: string | number, index: number) {
                return ALIGN[index](String(cell), widths[index]);
            })
            .join(" | ");
    });
    table.splice(
        1,
        0,
        widths
            .map(function (w, index) {
                if (index !== 0 && index !== widths.length - 1) {
                    w++;
                }

                return ALIGN[index](":", w + 1, "-");
            })
            .join("|")
    );

    Logger.log(table.join("\n"));
}

type TimingListener<T extends unknown[]> = (...args: T) => void | Promise<void>;

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> => {
    return typeof value === "object" && value !== null && typeof (value as PromiseLike<unknown>).then === "function";
};

const now = (): number => {
    const [seconds, nanoseconds] = process.hrtime();
    return seconds * 1e3 + nanoseconds / 1e6;
};

/**
 * Create a timer that measures the running time of rule listeners.
 *
 * Rule listeners are called concurrently and may return a Promise.
 * If the timer measured the wall-clock time of each listener independently,
 * the time of a listener would include the time of other listeners that run while it is waiting.
 * To attribute the time to each rule correctly, the wrapped listeners are executed one by one:
 * a wrapped listener starts after the previous wrapped listener has settled.
 * This changes the concurrency of rule listeners, so it should be used only for profiling.
 * @private
 */
export function createTiming() {
    const data: Record<string, number> = Object.create(null);
    // The queue of wrapped listeners. Each listener waits for the previous one.
    let queue: Promise<void> = Promise.resolve();

    /**
     * Time the run
     * @param {*} key key from the data object
     * @param {(...args: any[]) => any} fn function to be called
     * @returns {(...args: any[]) => any} function to be executed
     * @private
     */
    function time<T extends unknown[]>(key: string, fn: TimingListener<T>): (...args: T) => Promise<void> {
        if (typeof data[key] === "undefined") {
            data[key] = 0;
        }
        const run = async (args: T): Promise<void> => {
            const start = now();
            try {
                const result = fn(...args);
                if (isPromiseLike(result)) {
                    await result;
                }
            } finally {
                data[key] += now() - start;
            }
        };
        return function (...args: T) {
            const result = queue.then(() => run(args));
            // Continue the queue even if the listener throws an error
            queue = result.catch(() => undefined);
            return result;
        };
    }

    return {
        time,
        data
    };
}

/* istanbul ignore next */
export default (function () {
    if (isBrowser) {
        return {
            // In browser environment, return function as-is without timing measurement
            time<T extends unknown[]>(_key: string, fn: TimingListener<T>): TimingListener<T> {
                return fn;
            },
            enabled
        };
    }
    const { time, data } = createTiming();
    if (enabled) {
        process.on("exit", function () {
            display(data);
        });
    }

    return {
        time,
        enabled
    };
})();
