// LICENSE : MIT
"use strict";
const tryResolve = require('try-resolve');
const ObjectAssign = require("object-assign");
const debug = require('debug')('textlint:plugin-loader');
const path = require("path");
export function mapRulesConfig(rulesConfig, pluginName) {
    let mapped = {};
    Object.keys(rulesConfig).forEach(key => {
        mapped[`${pluginName}/${key}`] = rulesConfig[key];
    });
    return mapped;
}
export function loadRulesConfig(baseDir = ".", pluginNames = []) {
    var pluginRulesConfig = {};
    pluginNames.forEach(pluginName => {
        const textlintRuleName = `textlint-plugin-${ pluginName }`;
        const pkgPath = tryResolve(path.join(baseDir, textlintRuleName)) || tryResolve(path.join(baseDir, pluginName));
        if (!pkgPath) {
            throw new ReferenceError(`${ pluginName } is not found`);
        }
        var plugin = require(pkgPath);
        if (!plugin.hasOwnProperty("rulesConfig")) {
            debug(`${pluginName} has not rulesConfig`);
            return;
        }
        // set config of <rule> to "<plugin>/<rule>"
        ObjectAssign(pluginRulesConfig, mapRulesConfig(plugin.rulesConfig, pluginName));
    });
    return pluginRulesConfig;
}
