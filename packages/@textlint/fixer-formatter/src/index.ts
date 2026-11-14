// LICENSE : MIT
"use strict";
import type { TextlintFixResult } from "@textlint/types";
import { moduleInterop } from "@textlint/module-interop";
import fs from "node:fs";
import path from "node:path";
import debug0 from "debug";
import { tryResolve, dynamicImport } from "@textlint/resolver";
// formatters

type BuiltinFormatter = (results: TextlintFixResult[], options: FormatterOptions) => string;
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
type FormatterFunction = (results: TextlintFixResult[], formatterConfig: FormatterOptions) => string;
const isFormatterFunction = (formatter: unknown): formatter is FormatterFunction => {
    return typeof formatter === "function";
};
type BuiltInFormatterName = keyof typeof builtinFormatterList;
const builtinFormatterNames = Object.keys(builtinFormatterList);
const debug = debug0("textlint:textfix-formatter");

/**
 * Get the content of the source before fixing by `filePath` of the result.
 * It returns `undefined` if the caller does not have the content.
 */
export type FormatterGetSource = (filePath: string) => string | undefined;
export type FormatterConfig = {
    color?: boolean;
    formatterName: string;
    /**
     * Get the content of the source before fixing by `filePath` of the result.
     * For example, "diff" formatter uses it.
     * If it is not given or returns `undefined`, the formatter gets the content of the file of `filePath`.
     */
    getSource?: FormatterGetSource;
};
/**
 * The options that the formatter receives.
 * `loadFormatter()` always passes `getSource`.
 */
export type FormatterOptions = FormatterConfig & {
    getSource: FormatterGetSource;
};
/**
 * Create `getSource` for the formatter.
 * It returns the content from `getSource` of the caller, and reads the file of `filePath` if the caller does not have the content.
 * It returns `undefined` if the file can not be read.
 * A formatter gets the content only from this function, and does not read the file by itself.
 */
const createGetSource = (getSource?: FormatterGetSource): FormatterGetSource => {
    return (filePath) => {
        const source = getSource?.(filePath);
        if (source !== undefined) {
            return source;
        }
        try {
            return fs.readFileSync(filePath, "utf-8");
        } catch {
            return undefined;
        }
    };
};

export async function loadFormatter(config: FormatterConfig) {
    const formatterConfig: FormatterOptions = { ...config, getSource: createGetSource(config.getSource) };
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
