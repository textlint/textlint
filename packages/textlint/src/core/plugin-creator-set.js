"use strict";
// LICENSE : MIT
const assert = require("assert");
const getPlugins = rawPluginObject => {
    return Object.keys(rawPluginObject).map(key => {
        return rawPluginObject[key];
    });
};
/**
 * Plugin Creator
 */
export class PluginCreatorSet {
    /**
     * @param {Object} [pluginObject]
     * @param {Object} [pluginOptionObject]
     * @constructor
     */
    constructor(pluginObject = {}, pluginOptionObject = {}) {
        this.rawPlugins = pluginObject;
        /**
         * available rule object
         * @type {Object}
         */
        this.plugins = getPlugins(this.rawPlugins);
        /**
         * rule key names
         * @type {Array}
         */
        this.pluginNames = Object.keys(this.rawPlugins);

        /**
         * @type {Object}
         */
        this.pluginsOption = pluginOptionObject;
    }

    get availableExtensions() {
        return this.plugins.reduce((extensions, plugin) => {
            // static availableExtensions() method
            assert.ok(
                typeof plugin.Processor.availableExtensions === "function",
                `Processor(${plugin.Processor.name} should have availableExtensions()`
            );
            const extList = plugin.Processor.availableExtensions();
            return extensions.concat(extList);
        }, []);
    }

    /**
     * Convert this to TextlintKernel rules format
     * @returns {Array}
     */
    toKernelPluginsFormat() {
        return this.pluginNames.map(pluginName => {
            return {
                pluginId: pluginName,
                plugin: this.rawPlugins[pluginName],
                options: this.pluginsOption[pluginName]
            };
        });
    }
}
