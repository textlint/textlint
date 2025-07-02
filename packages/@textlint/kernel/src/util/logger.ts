// LICENSE : MIT
"use strict";

/* eslint-disable no-console */

/**
 * Logger Utils class
 * Use this instead of `console.log`
 * Main purpose for helping linting.
 */
export default class Logger {
    static log(...message: Array<unknown>) {
        console.log(...message);
    }

    static warn(...message: Array<unknown>) {
        console.warn(...message);
    }

    static error(...message: Array<unknown>) {
        console.error(...message);
    }
}

/* eslint-enable no-console */
