// LICENSE : MIT
"use strict";
const interopRequire = require("interop-require");
const ObjectAssign = require("object-assign");
const debug = require("debug")("textlint:plugin-loader");
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
export default function loadRulesConfigFromPlugins(pluginNames = [], moduleResolver) {
    var pluginRulesConfig = {};
    pluginNames.forEach(pluginName => {
        const pkgPath = moduleResolver.resolvePluginPackageName(pluginName);
        const plugin = interopRequire(pkgPath);
        if (!plugin.hasOwnProperty("rulesConfig")) {
            debug(`${pluginName} has not rulesConfig`);
            return;
        }
        // set config of <rule> to "<plugin>/<rule>"
        ObjectAssign(pluginRulesConfig, mapRulesConfig(plugin.rulesConfig, pluginName));
    });
    return pluginRulesConfig;
}
