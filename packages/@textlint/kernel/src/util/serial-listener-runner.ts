// LICENSE : MIT
"use strict";

export type MeasuredListener<T extends unknown[]> = (...args: T) => void | Promise<void>;

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> => {
    return typeof value === "object" && value !== null && typeof (value as PromiseLike<unknown>).then === "function";
};

type AsyncLocalStorageLike<S> = {
    getStore(): S | undefined;
    run<R>(store: S, callback: () => R): R;
};

/**
 * Create AsyncLocalStorage if it is available.
 * Use process.getBuiltinModule instead of importing "node:async_hooks", because this module is also bundled for browsers.
 */
const createAsyncLocalStorage = <S>(): AsyncLocalStorageLike<S> | undefined => {
    if (typeof process === "undefined") {
        return undefined;
    }
    const getBuiltinModule = (
        process as unknown as {
            getBuiltinModule?: (id: string) => { AsyncLocalStorage?: new () => AsyncLocalStorageLike<S> } | undefined;
        }
    ).getBuiltinModule;
    const AsyncLocalStorage = getBuiltinModule?.("node:async_hooks")?.AsyncLocalStorage;
    return AsyncLocalStorage ? new AsyncLocalStorage() : undefined;
};

export type SerialListenerRunner = {
    /**
     * Wrap the listener so that `record` gets its running time in milliseconds
     */
    measure<T extends unknown[]>(
        fn: MeasuredListener<T>,
        record: (milliseconds: number) => void
    ): (...args: T) => Promise<void> | undefined;
    /**
     * The total time of the listeners that ran at once when they were called, in milliseconds.
     * The caller of the listeners subtracts it to get its own time.
     */
    readonly immediateTime: number;
};

/**
 * Create a runner that measures the running time of rule listeners.
 *
 * Rule listeners are called concurrently and may return a Promise.
 * If the time of each listener were measured independently,
 * the time of a listener would include the time of other listeners that run while it is waiting.
 * To attribute the time to each listener correctly, the measured listeners are executed one by one:
 * a measured listener starts after the previous measured listener has settled.
 * While no measured listener is waiting for its Promise, a listener runs at once when it is called,
 * so synchronous listeners run in the same order and at the same time as without measurement.
 * An asynchronous listener makes the following listeners wait, which changes the concurrency of rule listeners,
 * so it should be used only for profiling.
 *
 * A listener may lint another text in it (nested lint) and wait for the result.
 * The listeners of the nested lint are called in the async context of the outer listener,
 * so they run immediately instead of waiting for the queue. Otherwise, they would wait for the outer listener forever.
 * The time of the nested lint is also included in the time of the outer listener.
 * @private
 */
export function createSerialListenerRunner(): SerialListenerRunner {
    // The last measured listener that has not settled. Other listeners wait for it.
    let pending: Promise<void> | undefined;
    // It has a value while a measured listener is running
    // If AsyncLocalStorage is not available, the listeners are not serialized.
    const runningListener = createAsyncLocalStorage<true>();
    let immediateTime = 0;

    const setPending = (promise: Promise<void>) => {
        // Continue the queue even if the listener throws an error
        const tail = promise.catch(() => undefined);
        pending = tail;
        void tail.then(() => {
            if (pending === tail) {
                pending = undefined;
            }
        });
    };

    const measure = <T extends unknown[]>(
        fn: MeasuredListener<T>,
        record: (milliseconds: number) => void
    ): ((...args: T) => Promise<void> | undefined) => {
        const runAsync = async (args: T): Promise<void> => {
            const start = performance.now();
            try {
                const result = fn(...args);
                if (isPromiseLike(result)) {
                    await result;
                }
            } finally {
                record(performance.now() - start);
            }
        };
        const runAtOnce = (args: T): Promise<void> | undefined => {
            const start = performance.now();
            let result: void | Promise<void>;
            try {
                result = runningListener ? runningListener.run(true, () => fn(...args)) : fn(...args);
            } catch (error) {
                const time = performance.now() - start;
                immediateTime += time;
                record(time);
                return Promise.reject(error);
            }
            if (!isPromiseLike(result)) {
                record(performance.now() - start);
                // include the time of recording, so that the caller does not get it
                immediateTime += performance.now() - start;
                return undefined;
            }
            immediateTime += performance.now() - start;
            // wait for the rest of the async listener, and let the following listeners wait for it
            const settled = Promise.resolve(result).then(
                () => {
                    record(performance.now() - start);
                },
                (error) => {
                    record(performance.now() - start);
                    throw error;
                }
            );
            setPending(settled);
            return settled;
        };
        return function (...args: T) {
            if (!runningListener || runningListener.getStore() !== undefined) {
                // nested lint or AsyncLocalStorage is not available
                return runAsync(args);
            }
            if (pending === undefined) {
                return runAtOnce(args);
            }
            // the time of queuing belongs to the listeners, not to the caller
            const start = performance.now();
            const result = pending.then(() => runningListener.run(true, () => runAsync(args)));
            setPending(result);
            immediateTime += performance.now() - start;
            return result;
        };
    };
    return {
        measure,
        get immediateTime() {
            return immediateTime;
        }
    };
}

/**
 * The runner shared by TIMING and the profiler.
 * Sharing it means that a listener measured by both runs once in the queue.
 * @private
 */
export const sharedSerialListenerRunner = createSerialListenerRunner();
