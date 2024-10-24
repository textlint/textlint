// LICENSE : MIT
"use strict";
import type { TextlintFixResult } from "@textlint/types";
import { moduleInterop } from "@textlint/module-interop";
import fs from "fs";
import path from "path";
import debug0 from "debug";
import { tryResolve, dynamicImport } from "@textlint/resolver";
// formatters
import compatsFormatter from "./formatters/compats";
import diffFormatter from "./formatters/diff";
import fixedResultFormatter from "./formatters/fixed-result";
import jsonFormatter from "./formatters/json";
import stylishFormatter from "./formatters/stylish";

const builtinFormatterList = {
    compats: compatsFormatter,
    diff: diffFormatter,
    "fixed-result": fixedResultFormatter,
    json: jsonFormatter,
    stylish: stylishFormatter
} as const;
type FormatterFunction = (results: TextlintFixResult[], formatterConfig: FormatterConfig) => string;
const isFormatterFunction = (formatter: any): formatter is FormatterFunction => {
    return typeof formatter === "function";
};
type BuiltInFormatterName = keyof typeof builtinFormatterList;
const builtinFormatterNames = Object.keys(builtinFormatterList);
const debug = debug0("textlint:textfix-formatter");

export type FormatterConfig = { color?: boolean; formatterName: string };

export async function loadFormatter(formatterConfig: FormatterConfig) {
    const formatterName = formatterConfig.formatterName;
    debug(`formatterName: ${formatterName}`);
    if (builtinFormatterNames.includes(formatterName as BuiltInFormatterName)) {
        return {
            format(results: TextlintFixResult[]) {
                return builtinFormatterList[formatterName as BuiltInFormatterName](results, formatterConfig);
            }
        };
    }
    let formatter: FormatterFunction;
    let formatterPath;
    if (fs.existsSync(formatterName)) {
        formatterPath = formatterName;
    } else if (fs.existsSync(path.resolve(process.cwd(), formatterName))) {
        formatterPath = path.resolve(process.cwd(), formatterName);
    } else {
        const pkgPath =
            tryResolve(`textlint-formatter-${formatterName}`, {
                parentModule: "fixer-formatter"
            }) ||
            tryResolve(formatterName, {
                parentModule: "fixer-formatter"
            });
        if (pkgPath) {
            formatterPath = pkgPath;
        }
    }
    if (!formatterPath) {
        throw new Error(`Could not find formatter ${formatterName}`);
    }
    try {
        const mod = moduleInterop(
            (
                await dynamicImport(formatterPath, {
                    parentModule: "fixer-formatter"
                })
            ).exports
        )?.default;
        if (!isFormatterFunction(mod)) {
            throw new Error(`formatter should export function, but ${formatterPath} exports ${typeof mod}`);
        }
        formatter = mod;
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
    if (builtinFormatterNames.includes(formatterName as BuiltInFormatterName)) {
        return function (results: TextlintFixResult[]) {
            return builtinFormatterList[formatterName as BuiltInFormatterName](results, formatterConfig);
        };
    }
    let formatter: (results: TextlintFixResult[], formatterConfig: FormatterConfig) => string;
    let formatterPath;
    if (fs.existsSync(formatterName)) {
        formatterPath = formatterName;
    } else if (fs.existsSync(path.resolve(process.cwd(), formatterName))) {
        formatterPath = path.resolve(process.cwd(), formatterName);
    } else {
        const pkgPath =
            tryResolve(`textlint-formatter-${formatterName}`, {
                parentModule: "fixer-formatter"
            }) ||
            tryResolve(formatterName, {
                parentModule: "fixer-formatter"
            });
        if (pkgPath) {
            formatterPath = pkgPath;
        }
    }
    if (!formatterPath) {
        throw new Error(`Could not find formatter ${formatterName}`);
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
    return builtinFormatterNames.map((name) => {
        return {
            name
        };
    });
}
