import { describe, it } from "vitest";
import assert from "node:assert";
import { PromiseEventEmitter } from "../../src/task/promise-event-emitter.js";

describe("PromiseEventEmitter", () => {
    it("should return undefined when there is no listener", () => {
        const emitter = new PromiseEventEmitter();
        assert.strictEqual(emitter.emit("Str", {}), undefined);
    });
    it("should call the listeners in order and return undefined when no listener returns a promise", () => {
        const emitter = new PromiseEventEmitter();
        const calls: string[] = [];
        emitter.on("Str", (arg) => {
            calls.push(`a:${arg}`);
        });
        emitter.on("Str", (arg) => {
            calls.push(`b:${arg}`);
        });
        assert.strictEqual(emitter.emit("Str", "node"), undefined);
        assert.deepStrictEqual(calls, ["a:node", "b:node"]);
    });
    it("should return a promise that waits for the listeners that return a promise", async () => {
        const emitter = new PromiseEventEmitter();
        let done = false;
        emitter.on("Str", () => {
            // sync listener
        });
        emitter.on("Str", async () => {
            await new Promise((resolve) => setTimeout(resolve, 1));
            done = true;
        });
        const promise = emitter.emit("Str", {});
        assert.ok(promise instanceof Promise);
        await promise;
        assert.strictEqual(done, true);
    });
    it("should reject when a listener returns a rejected promise", async () => {
        const emitter = new PromiseEventEmitter();
        emitter.on("Str", async () => {
            throw new Error("async error");
        });
        await assert.rejects(() => emitter.emit("Str", {}) as Promise<unknown>, /async error/);
    });
    it("should throw synchronously when a listener throws", () => {
        const emitter = new PromiseEventEmitter();
        emitter.on("Str", () => {
            throw new Error("sync error");
        });
        assert.throws(() => emitter.emit("Str", {}), /sync error/);
    });
});
