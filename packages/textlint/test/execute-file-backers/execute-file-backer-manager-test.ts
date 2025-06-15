// MIT © 2016 azu
"use strict";
import { TextlintResult } from "@textlint/types";
import { describe, it } from "vitest";
import assert from "node:assert";
import { ExecuteFileBackerManager } from "../../src/engine/execute-file-backer-manager.js";
import { AbstractBacker } from "../../src/engine/execute-file-backers/abstruct-backer.js";

describe("execute-file-backer-manager", function () {
    describe("when no backer", function () {
        it("should process all files", function () {
            const manager = new ExecuteFileBackerManager();
            const executeFile = (filePath: string) => {
                return Promise.resolve({ filePath, messages: [] });
            };
            const files = ["/file1.md", "/file2.md"];
            return manager.process(files, executeFile).then((results) => {
                assert.equal(results.length, files.length);
            });
        });
    });
    describe("when has backer", function () {
        it("call each backer lifecycle", function () {
            const manager = new ExecuteFileBackerManager();
            const callStack: string[] = [];

            class ExampleBacker extends AbstractBacker {
                shouldExecute({ filePath }: { filePath: string }) {
                    callStack.push(`shouldExecute:${filePath}`);
                    return true;
                }

                didExecute({ result }: { result: TextlintResult }) {
                    callStack.push(`didExecute:${result.filePath}`);
                }

                afterAll() {
                    callStack.push("afterAll");
                }
            }

            manager.add(new ExampleBacker());
            const executeFile = (filePath: string) => {
                return Promise.resolve({ filePath, messages: [] });
            };
            const files = ["/file1.md", "/file2.md"];
            return manager.process(files, executeFile).then(() => {
                assert.deepEqual(callStack, [
                    "shouldExecute:/file1.md",
                    "shouldExecute:/file2.md",
                    "didExecute:/file1.md",
                    "didExecute:/file2.md",
                    "afterAll"
                ]);
            });
        });
    });
    describe("when shouldExecute:false backer", function () {
        it("should return dummy result instead of actual result", function () {
            class ShouldNotExecuteBacker extends AbstractBacker {
                shouldExecute() {
                    return false;
                }
                didExecute() {}

                afterAll() {}
            }

            const manager = new ExecuteFileBackerManager();
            manager.add(new ShouldNotExecuteBacker());
            const executeFile = () => {
                throw new Error("not called");
            };
            const files = ["/file1.md", "/file2.md"];
            return manager.process(files, executeFile).then((results) => {
                assert.equal(results.length, files.length);
                const [res1, res2] = results;
                assert.ok(res1.filePath === files[0]);
                assert.ok(res1.messages.length === 0);
                assert.ok(res2.filePath === files[1]);
                assert.ok(res2.messages.length === 0);
            });
        });
    });
});
