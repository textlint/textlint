// LICENSE : MIT
"use strict";
const fs = require("fs");
const path = require("path");
const tryResolve = require("try-resolve");
const interopRequire = require("interop-require");
const isFile = require("is-file");
const debug = require("debug")("textlint:textfix-formatter");
import { TextlintTypes } from "@textlint/kernel";

export function createFormatter(formatterConfig: { formatterName: any }) {
    const formatterName = formatterConfig.formatterName;
    debug(`try formatterName: ${formatterName}`);
    let formatter: any;
    let formatterPath;
    if (fs.existsSync(formatterName)) {
        formatterPath = formatterName;
    } else if (fs.existsSync(path.resolve(process.cwd(), formatterName))) {
        formatterPath = path.resolve(process.cwd(), formatterName);
    } else {
        // FIXME: Move textfix-formatter to pacakges/
        if (isFile(`${path.join(__dirname, "formatters/", formatterName)}.js`)) {
            formatterPath = `${path.join(__dirname, "formatters/", formatterName)}.js`;
        } else if (isFile(`${path.join(__dirname, "formatters/", formatterName)}.ts`)) {
            formatterPath = `${path.join(__dirname, "formatters/", formatterName)}.ts`;
        } else {
            const pkgPath = tryResolve(`textlint-formatter-${formatterName}`) || tryResolve(formatterName);
            if (pkgPath) {
                formatterPath = pkgPath;
            }
        }
    }
    try {
        formatter = interopRequire(formatterPath);
    } catch (ex) {
        throw new Error(`Could not find formatter ${formatterName}
See https://github.com/textlint/textlint/issues/148
${ex}`);
    }
    debug(`use formatter: ${formatterPath}`);
    return function(results: TextlintTypes.TextlintFixResult[]) {
        return formatter(results, formatterConfig);
    };
}
