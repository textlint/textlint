"use strict";
// LICENSE : MIT
const assert = require("assert");
const getPlugins = (rawPluginObject) => {
    return Object.keys(rawPluginObject).map(key => {
        return rawPluginObject[key];
    });
};
/**
 * Plugin Creator
 */
export default class PluginCreatorSet {
    /**
     * @param {Object} [plugins]
     * @constructor
     */
    constructor(plugins = {}) {
        this.rawPlugins = plugins;
        /**
         * available rule object
         * @type {Object}
         */
        this.plugins = getPlugins(this.rawPlugins);
        /**
         * rule key names
         * @type {Array}
         */
        this.pluginNames = Object.keys(this.plugins);
    }

    get availableExtensions() {
        return this.plugins.reduce((extensions, processor) => {
            // static availableExtensions() method
            assert.ok(typeof processor.constructor.availableExtensions === "function",
                `Processor(${processor.constructor.name} should have availableExtensions()`);
            const extList = processor.constructor.availableExtensions();
            return extensions.concat(extList);
        }, []);
    }

    /**
     *
     * @param {string} ext
     * @returns {*|undefined}
     */
    findPluginWithExt(ext) {
        const matchProcessors = this.plugins.filter(processor => {
            // static availableExtensions() method
            assert.ok(typeof processor.constructor.availableExtensions === "function",
                `Processor(${processor.constructor.name} should have availableExtensions()`);
            const extList = processor.constructor.availableExtensions();
            return extList.some(targetExt => targetExt === ext || ("." + targetExt) === ext);
        });
        if (matchProcessors.length === 0) {
            return;
        }
        return matchProcessors[0];
    }

}
