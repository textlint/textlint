// LICENSE : MIT
"use strict";
const cosmiconfig = require("cosmiconfig");
const interopRequire = require("interop-require");
export default function load(configFilePath, {configFileName, moduleResolver}) {
    // if specify Config module, use it
    if (configFilePath) {
        try {
            const modulePath = moduleResolver.resolveConfigPackageName(configFilePath);
            return Promise.resolve(interopRequire(modulePath));
        } catch (error) {
            // not found config module
        }
    }
    const explorer = cosmiconfig(configFileName);
    return Promise.resolve().then(() => {
        if (configFilePath) {
            return explorer.load(null, configFilePath);
        }
        return explorer.load();
    }).then(result => {
        if (!result) {
            return {};
        }
        return result.config;
    });
}
