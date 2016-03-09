// LICENSE : MIT
"use strict";

/**
 * @type {TextLintFormatterOption}
 */
const defaultFormatterConfig = {
    // --format stylish
    // e.g.) stylish.js => set "stylish"
    formatterName: "stylish",
    // --no-color : false
    color: true
};
export default class FormatterConfig {
    constructor(options = {}) {
        /**
         * @type {string}
         */
        this.formatterName = options.formatterName ? options.formatterName : defaultFormatterConfig.formatterName;
        /**
         *
         * @type {boolean}
         */
        this.color = options.color !== undefined ? options.color : defaultFormatterConfig.color;
    }

    toJSON() {
        const r = Object.create(null);
        Object.keys(this).forEach(key => {
            if (!this.hasOwnProperty(key)) {
                return;
            }
            const value = this[key];
            if (value == null) {
                return;
            }
            r[key] = typeof value.toJSON !== "undefined" ? value.toJSON() : value;
        });
        return r;
    }
}
