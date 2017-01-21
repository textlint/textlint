"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadFromDir = loadFromDir;
var interopRequire = require("interop-require");
var fs = require("fs");
var path = require("path");
/**
 * Load all rule modules from specified directory.
 * These are filtered by [extname]
 * @param {String} [rulesDir] Path to rules directory, may be relative. Defaults to `lib/rules`.
 * @param {String} [extname] extension name
 * @returns {Object} Loaded rule modules by rule ids (file names).
 */
function loadFromDir(rulesDir) {
    var extname = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ".js";

    var rulesDirAbsolutePath = void 0;
    if (!rulesDir) {
        rulesDirAbsolutePath = path.join(__dirname, "rules");
    } else {
        rulesDirAbsolutePath = path.resolve(process.cwd(), rulesDir);
    }
    var rules = Object.create(null);
    fs.readdirSync(rulesDirAbsolutePath).forEach(function (file) {
        if (path.extname(file) !== extname) {
            return;
        }
        var withoutExt = file.slice(0, -3);
        rules[withoutExt] = interopRequire(path.join(rulesDirAbsolutePath, file));
    });
    return rules;
}
//# sourceMappingURL=rule-loader.js.map