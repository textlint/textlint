// MIT © 2016 azu
"use strict";
const assert = require("power-assert");
import ExecuteFileBackerManager from "../../src/engine/execute-file-backer-manager";
import AbstractBacker from "../../src/engine/execute-file-backers/abstruct-backer";
describe("execute-file-backer-manager", function() {
    context("when no backer", function() {
        it("should process all files", function() {
            const manager = new ExecuteFileBackerManager();
            const executeFile = (filePath) => {
                return Promise.resolve({filePath, messages: []});
            };
            const files = ["/file1.md", "/file2.md"];
            return manager.process(files, executeFile).then((results) => {
                assert.equal(results.length, files.length);
            });
        });
    });
    context("when has backer", function() {
        it("call each backer lifecycle", function() {
            const manager = new ExecuteFileBackerManager();
            const callStack = [];
            class ExampleBacker extends AbstractBacker {
                shouldExecute({filePath}) {
                    callStack.push(`shouldExecute:${filePath}`);
                    return true;
                }

                didExecute({result}) {
                    callStack.push(`didExecute:${result.filePath}`);
                }

                afterAll() {
                    callStack.push("afterAll");
                }
            }
            manager.add(new ExampleBacker());
            const executeFile = (filePath) => {
                return Promise.resolve({filePath, messages: []});
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
    context("when shouldExecute:false backer", function() {
        it("should return dummy result instead of actual result", function() {
            class ShouldNotExecuteBacker extends AbstractBacker {
                shouldExecute() {
                    return false;
                }
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
                assert(res1.filePath === files[0]);
                assert(res1.messages.length === 0);
                assert(res2.filePath === files[1]);
                assert(res2.messages.length === 0);
            });
        });
    });
});
