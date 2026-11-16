import { afterEach, describe, it } from "vitest";
import assert from "node:assert";
import { TextlintKernel, profiler } from "../../src/index.js";
import { TextlintProfiler } from "../../src/profile/profiler.js";
import { createPluginStub } from "../helper/ExamplePlugin.js";
import type { TextlintRuleReporter } from "@textlint/types";

const busyWait = (ms: number) => {
    const start = performance.now();
    while (performance.now() - start < ms) {
        // busy wait
    }
};

describe("TextlintProfiler", () => {
    it("keeps totals of a type and an id", () => {
        const p = new TextlintProfiler();
        p.record("parse", "markdown", 1);
        assert.deepStrictEqual(p.getEntries(), [], "nothing is recorded before enable()");
        p.enable();
        p.record("parse", "markdown", 1, "/a.md");
        p.record("parse", "markdown", 3, "/b.md");
        p.record("traverse", undefined, 2, "/a.md");
        const byKey = Object.fromEntries(p.getEntries().map((entry) => [`${entry.type}:${entry.id}`, entry]));
        assert.deepStrictEqual(byKey["parse:markdown"], { type: "parse", id: "markdown", count: 2, total: 4, max: 3 });
        assert.deepStrictEqual(byKey["traverse:undefined"], {
            type: "traverse",
            id: undefined,
            count: 1,
            total: 2,
            max: 2
        });
        assert.strictEqual(byKey["file:/a.md"].total, 3);
        assert.strictEqual(byKey["file:/b.md"].total, 3);
        p.disable();
        assert.deepStrictEqual(p.getEntries(), []);
    });
});

describe("profiler in the kernel", () => {
    afterEach(() => {
        profiler.disable();
    });
    const slowRule: TextlintRuleReporter = (context) => {
        return {
            [context.Syntax.Document]() {
                busyWait(20);
            }
        };
    };
    const fastRule: TextlintRuleReporter = (context) => {
        return {
            async [context.Syntax.Str]() {
                await Promise.resolve();
            }
        };
    };
    const lint = () => {
        const kernel = new TextlintKernel();
        const { plugin } = createPluginStub();
        return kernel.lintText("text", {
            ext: ".md",
            filePath: "/path/to/file.md",
            plugins: [{ pluginId: "example", plugin }],
            rules: [
                { ruleId: "slow", rule: slowRule },
                { ruleId: "fast", rule: fastRule }
            ]
        });
    };

    it("records nothing when it is disabled", async () => {
        await lint();
        assert.deepStrictEqual(profiler.getEntries(), []);
    });

    it("records parse, traverse, rules, post-process, and the file", async () => {
        profiler.enable();
        await lint();
        const entries = profiler.getEntries();
        const find = (type: string, id?: string) => entries.find((entry) => entry.type === type && entry.id === id);
        assert.strictEqual(find("parse", "example")?.count, 1);
        assert.strictEqual(find("traverse")?.count, 1);
        assert.strictEqual(find("post-process")?.count, 1);
        const slow = find("rule", "slow");
        const fast = find("rule", "fast");
        assert.ok(slow && slow.total >= 15, `slow: ${slow?.total}`);
        assert.ok(fast && fast.total < 15, `fast: ${fast?.total}`);
        const file = find("file", "/path/to/file.md");
        assert.ok(file && file.total >= slow.total, `file: ${file?.total}`);
    });
});
