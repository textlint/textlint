// LICENSE : MIT
"use strict";

/* eslint-disable no-console */

/**
 * Logger Utils class
 * Use this instead of `console.log`
 * Main purpose for helping linting.
 */
export class Logger {
    static log(...message: any[]) {
        console.log(...message);
    }

    static warn(...message: any[]) {
        console.warn(...message);
    }

    static deprecate(message: string): void {
        const templateDeprecatedionMessage = `textlint: ${message}

You can control this deprecation message by Node.js command-line flags.

If the NODE_OPTIONS=--throw-deprecation is used, the deprecation warning is thrown as an exception rather than being emitted as an event.
If the NODE_OPTIONS=--no-deprecation is used, the deprecation warning is suppressed.
If the NODE_OPTIONS=--trace-deprecation is used, the deprecation warning is printed to stderr along with the full stack trace.
        
`;
        process.emitWarning(templateDeprecatedionMessage, {
            type: "DeprecationWarning"
        });
    }

    static error(...message: any[]) {
        console.error(...message);
    }
}

/* eslint-enable no-console */
