// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = load;
var rc = require("rc-loader");
var interopRequire = require("interop-require");
function load(configFilePath, _ref) {
    var configFileName = _ref.configFileName,
        moduleResolver = _ref.moduleResolver;

    // if specify Config module, use it 
    if (configFilePath) {
        try {
            var modulePath = moduleResolver.resolveConfigPackageName(configFilePath);
            return interopRequire(modulePath);
        } catch (error) {
            // not found config module
        }
    }
    // auto or specify path to config file
    var config = configFilePath ? { config: configFilePath } : null;
    return rc(configFileName, {}, config);
}
//# sourceMappingURL=config-loader.js.map