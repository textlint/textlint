// LICENSE : MIT
"use strict";
let isExperimental = process.argv.indexOf("--experimental") !== -1;
let isRunningFromCLI = false;
let isRunningFromTester = false;
export function setRunningCLI(status) {
    isRunningFromCLI = status;
}
export function setRunningTest(status) {
    isRunningFromTester = status;
}
export function setExperimental(status) {
    isExperimental = status;
}
/**
 * if now is experimental, return
 * @returns {boolean}
 */
export function nowExperimental() {
    return isExperimental;
}

/**
 * if current is not experimental, throw error message.
 * @param message
 */
export function throwWithoutExperimental(message) {
    if (isRunningFromCLI && !isExperimental) {
        throw Error(message);
    }
}
/**
 * if current is in testing, throw error message.
 * @param {string} message
 */
export function throwIfTesting(message) {
    if (isRunningFromTester) {
        throw Error(message);
    }
}
