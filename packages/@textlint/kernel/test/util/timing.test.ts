import { describe, it } from "vitest";
import assert from "node:assert";
import { createTiming } from "../../src/util/timing.js";

const busyWait = (ms: number) => {
    const start = Date.now();
    while (Date.now() - start < ms) {
        // busy wait
    }
};

describe("timing", () => {
    it("should not include the time of other listeners", async () => {
        const { time, data } = createTiming();
        const fast = time("fast", () => {
            // do nothing
        });
        const slow = time("slow", () => {
            busyWait(50);
        });
        // Listeners are called concurrently like PromiseEventEmitter#emit
        await Promise.all([fast(), slow(), fast()]);
        assert.ok(data["slow"] >= 45, `slow: ${data["slow"]}`);
        assert.ok(data["fast"] < 25, `fast: ${data["fast"]}`);
    });
    it("should measure async listeners without other listeners' time", async () => {
        const { time, data } = createTiming();
        const asyncSlow = time("async-slow", async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            busyWait(50);
        });
        const fast = time("fast", async () => {
            await Promise.resolve();
        });
        await Promise.all([fast(), asyncSlow(), fast()]);
        assert.ok(data["async-slow"] >= 45, `async-slow: ${data["async-slow"]}`);
        assert.ok(data["fast"] < 25, `fast: ${data["fast"]}`);
    });
    it("should keep the order of listeners", async () => {
        const { time } = createTiming();
        const calls: string[] = [];
        const a = time("a", async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            calls.push("a");
        });
        const b = time("b", () => {
            calls.push("b");
        });
        await Promise.all([a(), b()]);
        assert.deepStrictEqual(calls, ["a", "b"]);
    });
    it("should propagate errors and continue other listeners", async () => {
        const { time, data } = createTiming();
        const error = time("error", () => {
            throw new Error("rule error");
        });
        const ok = time("ok", () => {
            // do nothing
        });
        const results = await Promise.allSettled([error(), ok()]);
        assert.strictEqual(results[0].status, "rejected");
        assert.strictEqual(results[1].status, "fulfilled");
        assert.ok(data["error"] >= 0);
        assert.ok(data["ok"] >= 0);
    });
    it("should not deadlock when a listener waits for nested listeners", async () => {
        const { time, data } = createTiming();
        const inner = time("inner", async () => {
            await Promise.resolve();
            busyWait(10);
        });
        const outer = time("outer", async () => {
            // e.g. lint a code block by another kernel in the listener
            await Promise.all([inner(), inner()]);
        });
        const other = time("other", () => {
            // do nothing
        });
        await Promise.all([outer(), other()]);
        assert.ok(data["inner"] >= 15, `inner: ${data["inner"]}`);
        assert.ok(data["outer"] >= 15, `outer: ${data["outer"]}`);
        assert.ok(data["other"] < 10, `other: ${data["other"]}`);
    });
});
