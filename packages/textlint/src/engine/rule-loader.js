"use strict";
const interopRequire = require("interop-require");
const fs = require("fs");
const path = require("path");
/**
 * Load all rule modules from specified directory.
 * These are filtered by [extname]
 * @param {String} [rulesDir] Path to rules directory, may be relative. Defaults to `lib/rules`.
 * @param {String} [extname] extension name
 * @returns {Object} Loaded rule modules by rule ids (file names).
 */
export function loadFromDir(rulesDir, extname = ".js") {
    let rulesDirAbsolutePath;
    if (!rulesDir) {
        rulesDirAbsolutePath = path.join(__dirname, "rules");
    } else {
        rulesDirAbsolutePath = path.resolve(process.cwd(), rulesDir);
    }
    const rules = Object.create(null);
    fs.readdirSync(rulesDirAbsolutePath).forEach(file => {
        if (path.extname(file) !== extname) {
            return;
        }
        const withoutExt = file.slice(0, -3);
        rules[withoutExt] = interopRequire(path.join(rulesDirAbsolutePath, file));
    });
    return rules;
}
