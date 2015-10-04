// LICENSE : MIT
"use strict";
const tryResolve = require('try-resolve');
const ObjectAssign = require("object-assign");
const debug = require('debug')('textlint:plugin-loader');
const path = require("path");
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
        pluginRulesConfig = ObjectAssign({}, pluginRulesConfig, plugin.rulesConfig);
    });
    return pluginRulesConfig;
}
