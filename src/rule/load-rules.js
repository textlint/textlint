'use strict';
// https://github.com/eslint/eslint/blob/master/lib/load-rules.js
const interopRequire = require('interop-require');
const fs = require('fs');
const path = require('path');
/**
 * Load all rule modules from specified directory.
 * @param {String} [rulesDir] Path to rules directory, may be relative. Defaults to `lib/rules`.
 * @returns {Object} Loaded rule modules by rule ids (file names).
 */
module.exports = function (rulesDir) {
    let rulesDirAbsolutePath;
    if (!rulesDir) {
        rulesDirAbsolutePath = path.join(__dirname, 'rules');
    } else {
        rulesDirAbsolutePath = path.resolve(process.cwd(), rulesDir);
    }
    const rules = Object.create(null);
    fs.readdirSync(rulesDirAbsolutePath).forEach(file => {
        if (path.extname(file) !== '.js') {
            return;
        }
        const withoutExt = file.slice(0, -3);
        rules[withoutExt] = interopRequire(path.join(rulesDir, file));
    });
    return rules;
};
