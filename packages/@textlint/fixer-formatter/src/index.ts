// LICENSE : MIT
"use strict";
import type { TextlintFixResult } from "@textlint/types";
import { moduleInterop } from "@textlint/module-interop";
import fs from "node:fs";
import path from "node:path";
import debug0 from "debug";
import { tryResolve, dynamicImport } from "@textlint/resolver";
// formatters

type BuiltinFormatter = (results: TextlintFixResult[], options: { color?: boolean }) => string;
/**
 * Each formatter is loaded when it is used.
 * For example, `diff` formatter loads `diff`, but `stylish` formatter does not.
 */
const builtinFormatterList = {
    compats: () => import("./formatters/compats.js"),
    diff: () => import("./formatters/diff.js"),
    "fixed-result": () => import("./formatters/fixed-result.js"),
    json: () => import("./formatters/json.js"),
    stylish: () => import("./formatters/stylish.js")
} as const;
/**
 * Load the formatter function of a built-in formatter.
 * A formatter file is a CommonJS module, so `import()` returns `{ default: module.exports }` in Node.js.
 * `moduleInterop` gets the default export from `module.exports`.
 */
const loadBuiltinFormatter = async (name: BuiltInFormatterName): Promise<BuiltinFormatter> => {
    const mod: { default: unknown } = await builtinFormatterList[name]();
    return moduleInterop(mod.default) as BuiltinFormatter;
};
type FormatterFunction = (results: TextlintFixResult[], formatterConfig: FormatterConfig) => string;
const isFormatterFunction = (formatter: unknown): formatter is FormatterFunction => {
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
        const builtinFormatter = await loadBuiltinFormatter(formatterName as BuiltInFormatterName);
        return {
            format(results: TextlintFixResult[]) {
                return builtinFormatter(results, formatterConfig);
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
