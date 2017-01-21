// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setRunningCLI = setRunningCLI;
exports.setRunningTest = setRunningTest;
exports.setExperimental = setExperimental;
exports.nowExperimental = nowExperimental;
exports.throwWithoutExperimental = throwWithoutExperimental;
exports.throwIfTesting = throwIfTesting;
var isExperimental = process.argv.indexOf("--experimental") !== -1;
var isRunningFromCLI = false;
var isRunningFromTester = false;
function setRunningCLI(status) {
    isRunningFromCLI = status;
}
function setRunningTest(status) {
    isRunningFromTester = status;
}
function setExperimental(status) {
    isExperimental = status;
}
/**
 * if now is experimental, return
 * @returns {boolean}
 */
function nowExperimental() {
    return isExperimental;
}

/**
 * if current is not experimental, throw error message.
 * @param message
 */
function throwWithoutExperimental(message) {
    if (isRunningFromCLI && !isExperimental) {
        throw Error(message);
    }
}
/**
 * if current is in testing, throw error message.
 * @param {string} message
 */
function throwIfTesting(message) {
    if (isRunningFromTester) {
        throw Error(message);
    }
}
//# sourceMappingURL=throw-log.js.map