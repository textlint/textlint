// LICENSE : MIT
"use strict";
import type { TextlintResult } from "@textlint/types";

import { moduleInterop } from "@textlint/module-interop";

import fs from "fs";
import path from "path";
// @ts-expect-error
import tryResolve from "try-resolve";
// @ts-expect-error
import isFile from "is-file";
import debug0 from "debug";
import { pathToFileURL } from "node:url";

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
    let formatter: (results: TextlintResult[], formatterConfig: FormatterConfig) => string;
    let formatterPath;
    if (fs.existsSync(formatterName)) {
        formatterPath = formatterName;
    } else if (fs.existsSync(path.resolve(process.cwd(), formatterName))) {
        formatterPath = path.resolve(process.cwd(), formatterName);
    } else {
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
    let formatter: (results: TextlintResult[], formatterConfig: FormatterConfig) => string;
    let formatterPath;
    if (fs.existsSync(formatterName)) {
        formatterPath = formatterName;
    } else if (fs.existsSync(path.resolve(process.cwd(), formatterName))) {
        formatterPath = path.resolve(process.cwd(), formatterName);
    } else {
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
    return fs
        .readdirSync(path.join(__dirname, "formatters"))
        .filter((file: string) => {
            return path.extname(file) === ".js";
        })
        .map((file: string) => {
            return { name: path.basename(file, ".js") };
        });
}
