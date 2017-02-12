// LICENSE : MIT
"use strict";
const rcConfigLoader = require("rc-config-loader");
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
    return rcConfigLoader(configFileName, {
        configFileName: configFilePath,
        defaultExtension: [".json", ".js", ".yml"]
    });
}
