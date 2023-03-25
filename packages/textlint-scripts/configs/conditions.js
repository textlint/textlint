const fs = require("fs");
const paths = require("../configs/paths");
/**
 * Return true if TypeScript is enabled
 * @type {boolean}
 */
const useTypeScript = fs.existsSync(paths.appTsConfig);
/**
 * Return true if package.json has `type: "module"`
 * @type {boolean}
 */
const useESModules = fs.existsSync(paths.packageJson) && require(paths.packageJson).type === "module";
module.exports.useTypeScript = useTypeScript;
module.exports.useESModules = useESModules;
