// LICENSE : MIT
"use strict";
import type { TextlintFixResult } from "@textlint/types";
import { moduleInterop } from "@textlint/module-interop";
import fs from "fs";
import path from "path";
import debug0 from "debug";
// @ts-expect-error
import isFile from "is-file";
// @ts-expect-error
import tryResolve from "try-resolve";
import { pathToFileURL } from "node:url";

// import() can not load Window file path
// convert file path to file URL before import()
// https://github.com/nodejs/node/issues/31710
export async function dynamicImport(targetPath: string) {
    const fileUrl = pathToFileURL(targetPath).href;
    return import(fileUrl);
}

const debug = debug0("textlint:textfix-formatter");

export type FormatterConfig = { color?: boolean; formatterName: string };

export async function loadFormatter(formatterConfig: FormatterConfig) {
    const formatterName = formatterConfig.formatterName;
    debug(`formatterName: ${formatterName}`);
    let formatter: (results: TextlintFixResult[], formatterConfig: FormatterConfig) => string;
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
        const moduleExports = (await dynamicImport(formatterPath)).default;
        formatter = moduleInterop(moduleExports);
    } catch (ex) {
        throw new Error(`Could not find formatter ${formatterName}
See https://github.com/textlint/textlint/issues/148
${ex}`);
    }
    debug(`use formatter: ${formatterPath}`);
    return {
        format(results: TextlintFixResult[]) {
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
    let formatter: (results: TextlintFixResult[], formatterConfig: FormatterConfig) => string;
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
See https://github.com/textlint/textlint/issues/148
${ex}`);
    }
    debug(`use formatter: ${formatterPath}`);
    return function (results: TextlintFixResult[]) {
        return formatter(results, formatterConfig);
    };
}

export interface FixerFormatterDetail {
    name: string;
}

export function getFixerFormatterList(): FixerFormatterDetail[] {
    return fs
        .readdirSync(path.join(__dirname, "formatters"))
        .filter((file: string) => {
            const fileName = path.extname(file);
            return fileName === ".js" || (fileName === ".ts" && !file.endsWith("d.ts"));
        })
        .map((file: string) => {
            return { name: path.basename(file, path.extname(file)) };
        });
}
