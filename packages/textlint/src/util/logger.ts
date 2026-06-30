// LICENSE : MIT

/* eslint-disable no-console */

/**
 * Logger Utils class
 * Use this instead of `console.log`
 * Main purpose for helping linting.
 */
export class Logger {
    static log(...message: unknown[]) {
        console.log(...message);
    }

    /**
     * Write to stdout without appending a newline.
     * Use this for formatter output where the trailing newline must match
     * the original content (e.g. fixed-result with --stdin).
     */
    static write(message: string) {
        process.stdout.write(message);
    }

    static warn(...message: unknown[]) {
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

    static error(...message: unknown[]) {
        console.error(...message);
    }
}

/* eslint-enable no-console */
