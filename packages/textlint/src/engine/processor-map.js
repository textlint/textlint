// LICENSE : MIT
"use strict";
const MapLike = require("map-like");
/**
 * Processor Map object
 */
export class PluginMap extends MapLike {
    toJSON() {
        const object = {};
        this.forEach((value, key) => {
            object[key] = value;
        });
        return object;
    }
}
