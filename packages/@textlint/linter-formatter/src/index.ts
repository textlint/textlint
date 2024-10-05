// LICENSE : MIT
"use strict";
import type { TextlintResult } from "@textlint/types";

import { moduleInterop } from "@textlint/module-interop";

import fs from "fs";
import path from "path";
// @ts-expect-error
import tryResolve from "try-resolve";
import debug0 from "debug";
import { pathToFileURL } from "node:url";
// formatter
import checkstyleFormatter from "./formatters/checkstyle";
import compactFormatter from "./formatters/compact";
import jslintXMLFormatter from "./formatters/jslint-xml";
import jsonFormatter from "./formatters/json";
import junitFormatter from "./formatters/junit";
import prettyErrorFormatter from "./formatters/pretty-error";
import stylishFormatter from "./formatters/stylish";
import tableFormatter from "./formatters/table";
import tapFormatter from "./formatters/tap";
import unixFormatter from "./formatters/unix";

const builtinFormatterList = {
    checkstyle: checkstyleFormatter,
    compact: compactFormatter,
    "jslint-xml": jslintXMLFormatter,
    json: jsonFormatter,
    junit: junitFormatter,
    "pretty-error": prettyErrorFormatter,
    stylish: stylishFormatter,
    table: tableFormatter,
    tap: tapFormatter,
    unix: unixFormatter
} as const;
type BuiltInFormatterName = keyof typeof builtinFormatterList;
const builtinFormatterNames = Object.keys(builtinFormatterList);
// import() can not load Window file path
// convert file path to file URL before import()
// https://github.com/nodejs/node/issues/31710
export async function dynamicImport(targetPath: string) {
    const fileUrl = pathToFileURL(targetPath).href;
    return import(fileUrl);
}

const debug = debug0("textlint:@textlint/linter-formatter");

export interface FormatterConfig {
    formatterName: string;
    color?: boolean;
}

export async function loadFormatter(formatterConfig: FormatterConfig) {
    const formatterName = formatterConfig.formatterName;
    debug(`formatterName: ${formatterName}`);
    if (builtinFormatterNames.includes(formatterName)) {
        return {
            format(results: TextlintResult[]) {
                return builtinFormatterList[formatterName as BuiltInFormatterName](results, formatterConfig);
            }
        };
    }
    let formatter: (results: TextlintResult[], formatterConfig: FormatterConfig) => string;
    let formatterPath;
    if (fs.existsSync(formatterName)) {
        formatterPath = formatterName;
    } else if (fs.existsSync(path.resolve(process.cwd(), formatterName))) {
        formatterPath = path.resolve(process.cwd(), formatterName);
    } else {
        const pkgPath = tryResolve(`textlint-formatter-${formatterName}`) || tryResolve(formatterName);
        if (pkgPath) {
            formatterPath = pkgPath;
        }
    }
    try {
        formatter = moduleInterop((await dynamicImport(formatterPath)).default);
    } catch (ex) {
        throw new Error(`Could not find formatter ${formatterName}
${ex}`);
    }
    return {
        format(results: TextlintResult[]) {
            return formatter(results, formatterConfig);
        }
    };
}

/**
 * @deprecated use loadFormatter
 * @param formatterConfig
 */
export function createFormatter(formatterConfig: FormatterConfig) {
    const formatterName = formatterConfig.formatterName;
    debug(`formatterName: ${formatterName}`);
    if (builtinFormatterNames.includes(formatterName)) {
        return function (results: TextlintResult[]) {
            return builtinFormatterList[formatterName as BuiltInFormatterName](results, formatterConfig);
        };
    }
    let formatter: (results: TextlintResult[], formatterConfig: FormatterConfig) => string;
    let formatterPath;
    if (fs.existsSync(formatterName)) {
        formatterPath = formatterName;
    } else if (fs.existsSync(path.resolve(process.cwd(), formatterName))) {
        formatterPath = path.resolve(process.cwd(), formatterName);
    } else {
        const pkgPath = tryResolve(`textlint-formatter-${formatterName}`) || tryResolve(formatterName);
        if (pkgPath) {
            formatterPath = pkgPath;
        }
    }
    try {
        formatter = moduleInterop(require(formatterPath));
    } catch (ex) {
        throw new Error(`Could not find formatter ${formatterName}
${ex}`);
    }
    return function (results: TextlintResult[]) {
        return formatter(results, formatterConfig);
    };
}

export interface FormatterDetail {
    name: string;
}

export function getFormatterList(): FormatterDetail[] {
    return builtinFormatterNames.map((name) => {
        return {
            name
        };
    });
}
