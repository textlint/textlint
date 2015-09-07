// LICENSE : MIT
"use strict";
var rc = require('rc-loader');
var tryResolve = require("try-resolve");
// DEFAULT CONFIG FILE NAME
var CONFIG_FILENAME = "textlint";
var CONFIG_PACKAGE_PREFIX = "textlint-config-";
function isConfigModule(filePath) {
    if (filePath == null) {
        return false;
    }
    // scoped module package
    return (filePath.charAt(0) === "@" || filePath.indexOf(CONFIG_PACKAGE_PREFIX) !== -1);
}
function load(configFilePath) {
    if (isConfigModule(configFilePath)) {
        // config as a module - shared config
        // FIXME: not tested function
        return require(tryResolve.relative(configFilePath))
    } else {
        // auto or specify config file
        var config = configFilePath ? {config: configFilePath} : null;
        return rc(CONFIG_FILENAME, {}, config);
    }
}
module.exports = load;