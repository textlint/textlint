// LICENSE : MIT
"use strict";
const fs = require("fs");
const path = require("path");
const tryResolve = require("try-resolve");
const interopRequire = require("interop-require");
const debug = require("debug")("textlint:textfix-formatter");
export default function createFormatter(formatterConfig) {
    const formatterName = formatterConfig.formatterName;
    debug("try formatterName: " + formatterName);
    let formatter;
    let formatterPath;
    if (fs.existsSync(formatterName)) {
        formatterPath = formatterName;
    } else if (fs.existsSync(path.resolve(process.cwd(), formatterName))) {
        formatterPath = path.resolve(process.cwd(), formatterName);
    } else {
        var pkgPath = tryResolve("textlint-formatter-" + formatterName) || tryResolve(formatterName);
        if (pkgPath) {
            formatterPath = pkgPath;
        } else {
            formatterPath = path.join(__dirname, "formatters/", formatterName);
        }
    }
    try {
        formatter = interopRequire(formatterPath);
    } catch (ex) {
        throw new Error(`Could not find formatter ${formatterName}
See https://github.com/textlint/textlint/issues/148
${ex}`);
    }
    debug("use formatter: " + formatterPath);
    return function (results) {
        return formatter(results, formatterConfig);
    };
}
