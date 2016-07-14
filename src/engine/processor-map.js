// LICENSE : MIT
"use strict";
const MapLike = require("map-like");
// Map like
export default class ProcessorMap extends MapLike {
    toJSON() {
        const object = {};
        this.forEach((value, key) => {
            object[key] = value;
        });
        return object;
    }
}
