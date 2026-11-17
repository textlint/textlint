// LICENSE : MIT
"use strict";
import { describe, it } from "vitest";
import * as assert from "node:assert";
import type { TextlintResult } from "@textlint/kernel";
import { ExecuteFileBackerManager } from "../../src/engine/execute-file-backer-manager.js";
import { AbstractBacker } from "../../src/engine/execute-file-backers/abstruct-backer.js";

const files = Array.from({ length: 100 }, (_, index) => `/path/to/${index}.md`);
const nextTick = () => new Promise((resolve) => setImmediate(resolve));

describe("engine/execute-file-backer-manager", function () {
    it("should return the results in the order of the files", async function () {
        const manager = new ExecuteFileBackerManager();
        const results = await manager.process(files, async (filePath): Promise<TextlintResult> => {
            // a later file finishes earlier
            if (filePath === files[0]) {
                await nextTick();
                await nextTick();
            }
            return { filePath, messages: [] };
        });
        assert.deepStrictEqual(
            results.map((result) => result.filePath),
            files
        );
    });
    it("should process a limited number of files at the same time", async function () {
        const manager = new ExecuteFileBackerManager();
        let running = 0;
        let maxRunning = 0;
        const results = await manager.process(files, async (filePath): Promise<TextlintResult> => {
            running++;
            maxRunning = Math.max(maxRunning, running);
            await nextTick();
            running--;
            return { filePath, messages: [] };
        });
        assert.strictEqual(results.length, files.length);
        assert.ok(
            maxRunning > 1,
            `${maxRunning} files at the same time: a rule that waits for I/O needs more than one`
        );
        assert.ok(maxRunning < files.length, `${maxRunning} files at the same time: all files`);
    });
    it("should put the files that a backer does not execute after the executed files", async function () {
        const didExecuteFiles: string[] = [];
        let afterAllCount = 0;
        class SkipOddBacker extends AbstractBacker {
            shouldExecute({ filePath }: { filePath: string }) {
                return files.indexOf(filePath) % 2 === 0;
            }
            didExecute<R extends TextlintResult>({ result }: { result: R }) {
                didExecuteFiles.push(result.filePath);
            }
            afterAll() {
                afterAllCount++;
            }
        }
        const manager = new ExecuteFileBackerManager([new SkipOddBacker()]);
        const results = await manager.process(files, async (filePath): Promise<TextlintResult> => {
            return { filePath, messages: [{ ruleId: "rule" } as TextlintResult["messages"][number]] };
        });
        const executed = files.filter((_, index) => index % 2 === 0);
        const skipped = files.filter((_, index) => index % 2 === 1);
        assert.deepStrictEqual(
            results.map((result) => result.filePath),
            [...executed, ...skipped]
        );
        assert.deepStrictEqual(
            results.map((result) => result.messages.length),
            [...executed.map(() => 1), ...skipped.map(() => 0)]
        );
        assert.deepStrictEqual(didExecuteFiles, executed);
        assert.strictEqual(afterAllCount, 1);
    });
    it("should reject and start no more files when a file fails", async function () {
        const manager = new ExecuteFileBackerManager();
        const started: string[] = [];
        await assert.rejects(
            manager.process(files, async (filePath): Promise<TextlintResult> => {
                started.push(filePath);
                await nextTick();
                if (filePath === files[0]) {
                    throw new Error("failed to lint");
                }
                return { filePath, messages: [] };
            }),
            /failed to lint/
        );
        await nextTick();
        await nextTick();
        assert.ok(started.length < files.length, `${started.length} files started`);
    });
});
