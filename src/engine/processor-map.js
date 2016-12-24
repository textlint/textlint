// LICENSE : MIT
"use strict";
const MapLike = require("map-like");
/**
 * Processor Map object
 */
export default class ProcessorMap extends MapLike {
    toJSON() {
        const object = {};
        this.forEach((value, key) => {
            object[key] = value;
        });
        return object;
    }
}
