"use strict";
import { moduleInterop } from "@textlint/module-interop";
import * as fs from "fs";
import * as path from "path";
import { TextlintKernelRule } from "@textlint/kernel";
import { pathToFileURL } from "node:url";

// import() can not load Window file path
// convert file path to file URL before import()
// https://github.com/nodejs/node/issues/31710
export async function dynamicImport(targetPath: string) {
    const fileUrl = pathToFileURL(targetPath).href;
    return import(fileUrl);
}

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

export async function loadFromDirAsESM(
    rulesDir: string,
    extnames: string[] | string = [".js", ".ts"]
): Promise<TextlintKernelRule[]> {
    let rulesDirAbsolutePath: string;
    if (!rulesDir) {
        rulesDirAbsolutePath = path.join(__dirname, "rules");
    } else {
        rulesDirAbsolutePath = path.resolve(process.cwd(), rulesDir);
    }
    const files = await fs.promises.readdir(rulesDirAbsolutePath);
    const ruleFiles = files.filter((file) => {
        if (Array.isArray(extnames)) {
            if (!extnames.includes(path.extname(file))) {
                return false;
            }
        } else {
            if (path.extname(file) !== extnames) {
                return false;
            }
        }
        return true;
    });

    return Promise.all(
        ruleFiles.map(async (ruleFile) => {
            const withoutExt = path.basename(ruleFile, path.extname(ruleFile));
            const mod = await dynamicImport(path.join(rulesDirAbsolutePath, ruleFile));
            const ruleModule = moduleInterop(mod.default);
            const ret: TextlintKernelRule = {
                rule: ruleModule,
                ruleId: withoutExt,
                options: true
            };
            return ret;
        })
    );
}
