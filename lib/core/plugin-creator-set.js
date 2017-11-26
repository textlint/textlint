"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// LICENSE : MIT
var assert = require("assert");
var getPlugins = function (rawPluginObject) {
    return Object.keys(rawPluginObject).map(function (key) {
        return rawPluginObject[key];
    });
};
/**
 * Plugin Creator
 */
var PluginCreatorSet = /** @class */ (function () {
    /**
     * @param {Object} [pluginObject]
     * @param {Object} [pluginOptionObject]
     * @constructor
     */
    function PluginCreatorSet(pluginObject, pluginOptionObject) {
        if (pluginObject === void 0) { pluginObject = {}; }
        if (pluginOptionObject === void 0) { pluginOptionObject = {}; }
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
    Object.defineProperty(PluginCreatorSet.prototype, "availableExtensions", {
        get: function () {
            return this.plugins.reduce(function (extensions, plugin) {
                // static availableExtensions() method
                assert.ok(typeof plugin.Processor.availableExtensions === "function", "Processor(" + plugin.Processor.name + " should have availableExtensions()");
                var extList = plugin.Processor.availableExtensions();
                return extensions.concat(extList);
            }, []);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Convert this to TextlintKernel rules format
     * @returns {Array}
     */
    PluginCreatorSet.prototype.toKernelPluginsFormat = function () {
        var _this = this;
        return this.pluginNames.map(function (pluginName) {
            return {
                pluginId: pluginName,
                plugin: _this.rawPlugins[pluginName],
                options: _this.pluginsOption[pluginName]
            };
        });
    };
    return PluginCreatorSet;
}());
exports.PluginCreatorSet = PluginCreatorSet;
