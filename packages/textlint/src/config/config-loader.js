// LICENSE : MIT
"use strict";
const rc = require("rc-loader");
const interopRequire = require("interop-require");
export default function load(configFilePath, {configFileName, moduleResolver}) {
    // if specify Config module, use it 
    if (configFilePath) {
        try {
            const modulePath = moduleResolver.resolveConfigPackageName(configFilePath);
            return interopRequire(modulePath);
        } catch (error) {
            // not found config module
        }
    }
    // auto or specify path to config file
    const config = configFilePath ? {config: configFilePath} : null;
    return rc(configFileName, {}, config);
}
