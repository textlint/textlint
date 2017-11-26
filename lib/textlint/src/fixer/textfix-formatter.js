// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var tryResolve = require("try-resolve");
var interopRequire = require("interop-require");
var isFile = require("is-file");
var debug = require("debug")("textlint:textfix-formatter");
function createFormatter(formatterConfig) {
    var formatterName = formatterConfig.formatterName;
    debug("try formatterName: " + formatterName);
    var formatter;
    var formatterPath;
    if (fs.existsSync(formatterName)) {
        formatterPath = formatterName;
    }
    else if (fs.existsSync(path.resolve(process.cwd(), formatterName))) {
        formatterPath = path.resolve(process.cwd(), formatterName);
    }
    else {
        // FIXME: Move textfix-formatter to pacakges/
        if (isFile(path.join(__dirname, "formatters/", formatterName) + ".js")) {
            formatterPath = path.join(__dirname, "formatters/", formatterName) + ".js";
        }
        else if (isFile(path.join(__dirname, "formatters/", formatterName) + ".ts")) {
            formatterPath = path.join(__dirname, "formatters/", formatterName) + ".ts";
        }
        else {
            var pkgPath = tryResolve("textlint-formatter-" + formatterName) || tryResolve(formatterName);
            if (pkgPath) {
                formatterPath = pkgPath;
            }
        }
    }
    try {
        formatter = interopRequire(formatterPath);
    }
    catch (ex) {
        throw new Error("Could not find formatter " + formatterName + "\nSee https://github.com/textlint/textlint/issues/148\n" + ex);
    }
    debug("use formatter: " + formatterPath);
    return function (results) {
        return formatter(results, formatterConfig);
    };
}
exports.createFormatter = createFormatter;
