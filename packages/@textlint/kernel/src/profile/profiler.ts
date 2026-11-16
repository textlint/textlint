// LICENSE : MIT
"use strict";
import { MeasuredListener, sharedSerialListenerRunner } from "../util/serial-listener-runner.js";

/**
 * A total of the profiler.
 * `type` is what was measured, such as "parse", "traverse", "rule", or "file".
 * `id` is the target: a plugin id, a rule id, or a file path. It is undefined for a phase without a target.
 * Times are in milliseconds.
 */
export type TextlintProfileEntry = {
    type: string;
    id: string | undefined;
    count: number;
    total: number;
    max: number;
};

/**
 * The type of the total that sums the time of each file.
 */
const FILE_TYPE = "file";

/**
 * The profiler keeps totals of the time of the work of textlint: phases, parsers, rules, and files.
 * It is off by default, and nothing is recorded until it is enabled.
 * The totals do not grow with the number of records, only with the number of types and ids.
 */
export class TextlintProfiler {
    private _enabled = false;
    private readonly _entries = new Map<string, TextlintProfileEntry>();

    get enabled(): boolean {
        return this._enabled;
    }

    enable(): void {
        this._enabled = true;
    }

    /**
     * Disable the profiler and clear the totals
     */
    disable(): void {
        this._enabled = false;
        this._entries.clear();
    }

    /**
     * Add a record to the total of the type and the id.
     * When `filePath` is given, the time is also added to the total of the file.
     */
    record(type: string, id: string | undefined, milliseconds: number, filePath?: string): void {
        if (!this._enabled) {
            return;
        }
        this._add(type, id, milliseconds);
        if (filePath !== undefined) {
            this._add(FILE_TYPE, filePath, milliseconds);
        }
    }

    /**
     * Run `fn` and record its time. It returns the result of `fn`.
     */
    measure<R>(type: string, id: string | undefined, fn: () => R, filePath?: string): R {
        if (!this._enabled) {
            return fn();
        }
        const start = performance.now();
        try {
            return fn();
        } finally {
            this.record(type, id, performance.now() - start, filePath);
        }
    }

    /**
     * Run `fn` and record the time until the Promise settles. It returns the result of `fn`.
     */
    async measureAsync<R>(type: string, id: string | undefined, fn: () => Promise<R>, filePath?: string): Promise<R> {
        if (!this._enabled) {
            return fn();
        }
        const start = performance.now();
        try {
            return await fn();
        } finally {
            this.record(type, id, performance.now() - start, filePath);
        }
    }

    /**
     * Wrap a listener of a rule so that its time is recorded.
     * The wrapped listeners run one after another. See createSerialListenerRunner.
     * @private
     */
    wrapListener<T extends unknown[]>(
        type: string,
        id: string,
        filePath: string | undefined,
        fn: MeasuredListener<T>
    ): (...args: T) => Promise<void> | undefined {
        // look up the totals once, because a listener can be called for every node
        const entry = this._entry(type, id);
        const fileEntry = filePath !== undefined ? this._entry(FILE_TYPE, filePath) : undefined;
        return sharedSerialListenerRunner.measure(fn, (milliseconds) => {
            if (!this._enabled) {
                return;
            }
            addTo(entry, milliseconds);
            if (fileEntry !== undefined) {
                addTo(fileEntry, milliseconds);
            }
        });
    }

    /**
     * The total time of the wrapped listeners that ran, or were queued, when they were called.
     * The traversal subtracts it from its own time.
     * @private
     */
    get listenerTime(): number {
        return sharedSerialListenerRunner.immediateTime;
    }

    /**
     * Return a copy of the totals
     */
    getEntries(): TextlintProfileEntry[] {
        const entries: TextlintProfileEntry[] = [];
        for (const entry of this._entries.values()) {
            // a total of a listener that was never called
            if (entry.count > 0) {
                entries.push({ ...entry });
            }
        }
        return entries;
    }

    private _add(type: string, id: string | undefined, milliseconds: number): void {
        addTo(this._entry(type, id), milliseconds);
    }

    private _entry(type: string, id: string | undefined): TextlintProfileEntry {
        const key = id === undefined ? type : `${type}\0${id}`;
        let entry = this._entries.get(key);
        if (entry === undefined) {
            entry = { type, id, count: 0, total: 0, max: 0 };
            this._entries.set(key, entry);
        }
        return entry;
    }
}

const addTo = (entry: TextlintProfileEntry, milliseconds: number): void => {
    entry.count++;
    entry.total += milliseconds;
    if (milliseconds > entry.max) {
        entry.max = milliseconds;
    }
};

/**
 * The profiler that the kernel and the CLI of textlint record to.
 */
export const profiler = new TextlintProfiler();
