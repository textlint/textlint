// LICENSE : MIT
"use strict";
const experimental = process.argv.indexOf("--experimental") !== -1;
let isRunningFromCLI = false;
let isRunningFromTester = false;
export function setRunningCLI(status) {
    isRunningFromCLI = status;
}
export function setRunningTest(status) {
    isRunningFromTester = status;
}
/**
 * if current is not experimental, throw error message.
 * @param message
 */
export function throwWithoutExperimental(message) {
    if (isRunningFromCLI && !experimental) {
        throw Error(message);
    }
}
/**
 * if current is in testing, throw error message.
 * @param message
 */
export function throwIfTesting(message) {
    if (isRunningFromTester) {
        throw Error(message);
    }
}