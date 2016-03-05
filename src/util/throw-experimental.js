// LICENSE : MIT
"use strict";
const experimental = process.argv.indexOf("--experimental") !== -1;
let isRunningFromCLI = false;
export function setRunningCLI(status) {
    isRunningFromCLI = status;
}
/**
 * if current is not experimental, throw error message.
 *
 * @param message
 */
export default function experimentalThrow(message) {
    if (isRunningFromCLI && !experimental) {
        throw Error(message);
    }
}