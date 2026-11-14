// LICENSE : MIT
"use strict";
import type { TextlintResult } from "@textlint/types";

import { moduleInterop } from "@textlint/module-interop";

import fs from "node:fs";
import path from "node:path";
import { dynamicImport, tryResolve } from "@textlint/resolver";
import debug0 from "debug";
import type { FormatterGetSource, FormatterOptions } from "./FormatterOptions.js";
export type { FormatterGetSource, FormatterOptions } from "./FormatterOptions.js";

type BuiltinFormatter = (results: TextlintResult[], options: FormatterOptions) => string;
/**
 * Each formatter is loaded when it is used.
 * For example, `tap` formatter loads `js-yaml`, but `stylish` formatter does not.
 */
const builtinFormatterList = {
    checkstyle: () => import("./formatters/checkstyle.js"),
    compact: () => import("./formatters/compact.js"),
    github: () => import("./formatters/github.js"),
    "jslint-xml": () => import("./formatters/jslint-xml.js"),
    json: () => import("./formatters/json.js"),
    junit: () => import("./formatters/junit.js"),
    "pretty-error": () => import("./formatters/pretty-error.js"),
    stylish: () => import("./formatters/stylish.js"),
    table: () => import("./formatters/table.js"),
    tap: () => import("./formatters/tap.js"),
    unix: () => import("./formatters/unix.js")
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
type BuiltInFormatterName = keyof typeof builtinFormatterList;
const builtinFormatterNames = Object.keys(builtinFormatterList);
const debug = debug0("textlint:@textlint/linter-formatter");
type FormatterFunction = (results: TextlintResult[], formatterConfig: FormatterConfig) => string;
const isFormatterFunction = (formatter: unknown): formatter is FormatterFunction => {
    return typeof formatter === "function";
};

export interface FormatterConfig {
    formatterName: string;
    color?: boolean;
    /**
     * Get the content of the linted source by `filePath` of the result.
     * The results do not have the content, so a formatter that needs the content gets it from this function.
     * For example, "pretty-error" formatter uses it.
     * If it is not given or returns `undefined`, the formatter gets the content of the file of `filePath`.
     */
    getSource?: FormatterGetSource;
}

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
    const formatterConfig: FormatterConfig = { ...config, getSource: createGetSource(config.getSource) };
    const formatterName = formatterConfig.formatterName;
    debug(`formatterName: ${formatterName}`);
    if (builtinFormatterNames.includes(formatterName)) {
        const builtinFormatter = await loadBuiltinFormatter(formatterName as BuiltInFormatterName);
        return {
            format(results: TextlintResult[]) {
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
                parentModule: "linter-formatter"
            }) ||
            tryResolve(formatterName, {
                parentModule: "linter-formatter"
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
                    parentModule: "linter-formatter"
                })
            ).exports
        )?.default;
        if (!isFormatterFunction(mod)) {
            throw new Error(`formatter should export function, but ${formatterPath} exports ${typeof mod}`);
        }
        formatter = mod;
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
