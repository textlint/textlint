// LICENSE : MIT
'use strict';
const rc = require('rc-loader');
const tryResolve = require('try-resolve');
// DEFAULT CONFIG FILE NAME
const CONFIG_FILENAME = 'textlint';
const CONFIG_PACKAGE_PREFIX = 'textlint-config-';
function isConfigModule(filePath) {
    if (filePath == null) {
        return false;
    }
    // scoped module package || textlint-config-* module
    return filePath.charAt(0) === '@' || filePath.indexOf(CONFIG_PACKAGE_PREFIX) !== -1;
}
function load(configFilePath) {
    if (isConfigModule(configFilePath)) {
        // config as a module - shared config
        // FIXME: not tested function
        return require(tryResolve(configFilePath));
    } else {
        // auto or specify config file
        const config = configFilePath ? {config: configFilePath} : null;
        return rc(CONFIG_FILENAME, {}, config);
    }
}
module.exports = load;
