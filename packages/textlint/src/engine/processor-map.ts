// LICENSE : MIT
"use strict";

/**
 * Processor Map object
 */
export class PluginMap extends Map<string, (...args: unknown[]) => unknown> {
    toJSON() {
        const object: Record<string, unknown> = {};
        this.forEach((value, key) => {
            object[key] = value;
        });
        return object;
    }
}
