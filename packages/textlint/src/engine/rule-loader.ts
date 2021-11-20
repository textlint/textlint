"use strict";
import { moduleInterop } from "@textlint/module-interop";
import * as fs from "fs";
import * as path from "path";

/**
 * Load all rule modules from specified directory.
 * These are filtered by [extname]
 * @param {String} [rulesDir] Path to rules directory, may be relative. Defaults to `lib/rules`.
 * @param {String | String[]} [extnames] extension names
 * @returns {Object} Loaded rule modules by rule ids (file names).
 */
export function loadFromDir(rulesDir: string, extnames: string[] | string = [".js", ".ts"]): { [index: string]: any } {
    let rulesDirAbsolutePath: string;
    if (!rulesDir) {
        rulesDirAbsolutePath = path.join(__dirname, "rules");
    } else {
        rulesDirAbsolutePath = path.resolve(process.cwd(), rulesDir);
    }
    const rules = Object.create(null);
    fs.readdirSync(rulesDirAbsolutePath).forEach((file: string) => {
        if (Array.isArray(extnames)) {
            if (!extnames.includes(path.extname(file))) {
                return;
            }
        } else {
            if (path.extname(file) !== extnames) {
                return;
            }
        }
        const withoutExt = path.basename(file, path.extname(file));
        rules[withoutExt] = moduleInterop(require(path.join(rulesDirAbsolutePath, file)));
    });
    return rules;
}
