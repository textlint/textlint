// LICENSE : MIT
"use strict";

/**
 * Processor Map object
 */
export class PluginMap extends Map<string, (...args: any[]) => any> {
    toJSON() {
        const object = {};
        this.forEach((value, key) => {
            (object as any)[key] = value;
        });
        return object;
    }
}
