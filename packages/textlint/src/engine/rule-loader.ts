"use strict";
import { moduleInterop } from "@textlint/module-interop";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";

const convertToFileUrl = (filePath: string) => {
    return url.pathToFileURL(filePath).href;
};
/**
 * Load all rule modules from specified directory.
 * These are filtered by [extname]
 * @param {String} [rulesDir] Path to rules directory, may be relative. Defaults to `lib/rules`.
 * @param {String | String[]} [extnames] extension names
 * @returns {Object} Loaded rule modules by rule ids (file names).
 */
export async function loadFromDir(
    rulesDir: string,
    extnames: string[] | string = [".js", ".ts"]
): Promise<{ [index: string]: any }> {
    let rulesDirAbsolutePath: string;
    if (!rulesDir) {
        rulesDirAbsolutePath = path.join(__dirname, "rules");
    } else {
        rulesDirAbsolutePath = path.resolve(process.cwd(), rulesDir);
    }
    const rules = Object.create(null);
    const dirs = await fs.promises.readdir(rulesDirAbsolutePath);
    for (const file of dirs) {
        if (Array.isArray(extnames)) {
            if (!extnames.includes(path.extname(file))) {
                continue;
            }
        } else {
            if (path.extname(file) !== extnames) {
                continue;
            }
        }
        const withoutExt = path.basename(file, path.extname(file));
        const filePath = path.join(rulesDirAbsolutePath, file);
        const moduleExports = await import(convertToFileUrl(filePath));
        rules[withoutExt] = moduleInterop(moduleExports).default;
    }
    return rules;
}
