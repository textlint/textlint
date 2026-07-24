// LICENSE : MIT
"use strict";
import type { TextlintFixResult } from "@textlint/types";
import { moduleInterop } from "@textlint/module-interop";
import fs from "node:fs";
import path from "node:path";
import debug0 from "debug";
import { tryResolve, dynamicImport } from "@textlint/resolver";
// formatters
import compatsFormatter from "./formatters/compats.js";
import diffFormatter from "./formatters/diff.js";
import fixedResultFormatter from "./formatters/fixed-result.js";
import jsonFormatter from "./formatters/json.js";
import stylishFormatter from "./formatters/stylish.js";

const builtinFormatterList = {
    compats: compatsFormatter,
    diff: diffFormatter,
    "fixed-result": fixedResultFormatter,
    json: jsonFormatter,
    stylish: stylishFormatter
} as const;
type FormatterFunction = (results: TextlintFixResult[], formatterConfig: FormatterConfig) => string;
const isFormatterFunction = (formatter: unknown): formatter is FormatterFunction => {
    return typeof formatter === "function";
};
type BuiltInFormatterName = keyof typeof builtinFormatterList;
const builtinFormatterNames = Object.keys(builtinFormatterList);
// Keep this local to avoid a package dependency cycle with @textlint/linter-formatter.
// These linter-only built-in names must not resolve to same-named npm packages, such as pretty-error.
const linterOnlyFormatterNames = [
    "checkstyle",
    "compact",
    "github",
    "jslint-xml",
    "junit",
    "pretty-error",
    "table",
    "tap",
    "unix"
];
const debug = debug0("textlint:textfix-formatter");

export type FormatterConfig = { color?: boolean; formatterName: string };

function findFormatterPath(formatterName: string): string | null {
    if (builtinFormatterNames.includes(formatterName as BuiltInFormatterName)) {
        return formatterName;
    }
    if (fs.existsSync(formatterName)) {
        return formatterName;
    }
    const formatterPath = path.resolve(process.cwd(), formatterName);
    if (fs.existsSync(formatterPath)) {
        return formatterPath;
    }
    return (
        tryResolve(`textlint-formatter-${formatterName}`, {
            parentModule: "fixer-formatter"
        }) ||
        tryResolve(formatterName, {
            parentModule: "fixer-formatter"
        }) ||
        null
    );
}

export function resolveFormatter(formatterName: string): string | null {
    if (linterOnlyFormatterNames.includes(formatterName)) {
        return null;
    }
    return findFormatterPath(formatterName);
}

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
    const formatterPath = findFormatterPath(formatterName);
    let formatter: FormatterFunction;
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
