// LICENSE : MIT
"use strict";

/* eslint-disable no-console */

/**
 * Logger Utils class
 * Use this instead of `console.log`
 * Main purpose for helping linting.
 */
export default class Logger {
    static log(...message) {
        console.log(...message);
    }

    static warn(...message) {
        console.warn(...message);
    }

    static error(...message) {
        console.error(...message);
    }
}


/* eslint-enable no-console */
