// LICENSE : MIT
"use strict";
const rc = require("rc-loader");
const tryResolve = require("try-resolve");
const interopRequire = require("interop-require");
function isConfigModule(filePath, configPackagePrefix) {
    if (filePath == null) {
        return false;
    }
    // scoped module package || textlint-config-* module
    return filePath.charAt(0) === "@" || filePath.indexOf(configPackagePrefix) !== -1;
}
function load(configFilePath, {configFileName,configPackagePrefix}) {
    if (isConfigModule(configFilePath, configPackagePrefix)) {
        // config as a module - shared config
        // FIXME: not tested function
        return interopRequire(tryResolve(configFilePath));
    } else {
        // auto or specify config file
        const config = configFilePath ? {config: configFilePath} : null;
        return rc(configFileName, {}, config);
    }
}
module.exports = load;
