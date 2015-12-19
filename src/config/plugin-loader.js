// LICENSE : MIT
"use strict";
const interopRequire = require('interop-require');
const tryResolve = require('try-resolve');
const ObjectAssign = require("object-assign");
const debug = require('debug')('textlint:plugin-loader');
const path = require("path");
export function mapRulesConfig(rulesConfig, pluginName) {
    let mapped = {};
    if (rulesConfig === undefined) {
        return mapped;
    }
    Object.keys(rulesConfig).forEach(key => {
        mapped[`${pluginName}/${key}`] = rulesConfig[key];
    });
    return mapped;
}
// load rulesConfig from plugins
export default function loadRulesConfigFromPlugins(pluginNames = [], {
    baseDir = ".",
    pluginPrefix
    }) {
    var pluginRulesConfig = {};
    pluginNames.forEach(pluginName => {
        const textlintRuleName = `${pluginPrefix}${pluginName}`;
        const pkgPath = tryResolve(path.join(baseDir, textlintRuleName)) || tryResolve(path.join(baseDir, pluginName));
        if (!pkgPath) {
            throw new ReferenceError(`${ pluginName } is not found. Try to load ${path.join(baseDir, pluginName)}`);
        }
        var plugin = interopRequire(pkgPath);
        if (!plugin.hasOwnProperty("rulesConfig")) {
            debug(`${pluginName} has not rulesConfig`);
            return;
        }
        // set config of <rule> to "<plugin>/<rule>"
        ObjectAssign(pluginRulesConfig, mapRulesConfig(plugin.rulesConfig, pluginName));
    });
    return pluginRulesConfig;
}
