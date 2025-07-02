// LICENSE : MIT
"use strict";

/**
 * Processor Map object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class PluginMap extends Map<string, (...args: any[]) => any> {
    toJSON() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const object: any = {};
        this.forEach((value, key) => {
            object[key] = value;
        });
        return object;
    }
}
