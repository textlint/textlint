// LICENSE : MIT
"use strict";
const interopRequire = require("interop-require");
const ObjectAssign = require("object-assign");
const debug = require("debug")("textlint:plugin-loader");
const assert = require("assert");
export function mapRulesConfig(rulesConfig, pluginName) {
    const mapped = {};
    if (rulesConfig === undefined) {
        return mapped;
    }
    Object.keys(rulesConfig).forEach(key => {
        mapped[`${pluginName}/${key}`] = rulesConfig[key];
    });
    return mapped;
}
// load rulesConfig from plugins
/**
 *
 * @param pluginNames
 * @param {TextLintModuleResolver} moduleResolver
 * @returns {{}}
 */
export function loadRulesConfig(pluginNames = [], moduleResolver) {
    const pluginRulesConfig = {};
    pluginNames.forEach(pluginName => {
        const pkgPath = moduleResolver.resolvePluginPackageName(pluginName);
        const plugin = interopRequire(pkgPath);
        if (!plugin.hasOwnProperty("rulesConfig")) {
            return;
        }
        debug(`${pluginName} has rulesConfig`);
        // set config of <rule> to "<plugin>/<rule>"
        ObjectAssign(pluginRulesConfig, mapRulesConfig(plugin.rulesConfig, pluginName));
    });
    return pluginRulesConfig;
}

export function loadAvailableExtensions(pluginNames = [], moduleResolver) {
    const availableExtensions = [];
    pluginNames.forEach(pluginName => {
        const pkgPath = moduleResolver.resolvePluginPackageName(pluginName);
        const plugin = interopRequire(pkgPath);
        if (!plugin.hasOwnProperty("Processor")) {
            return;
        }
        const Processor = plugin.Processor;
        debug(`${pluginName} has Processor`);
        assert(typeof Processor.availableExtensions === "function", "Processor.availableExtensions() should be implemented");
        availableExtensions.push(...Processor.availableExtensions());
    });
    return availableExtensions;
}
