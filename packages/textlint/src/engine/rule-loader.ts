"use strict";
import { moduleInterop } from "@textlint/module-interop";
import * as fs from "node:fs";
import * as path from "node:path";
import { TextlintKernelRule } from "@textlint/kernel";
import { dynamicImport } from "@textlint/resolver";
import { isTextlintRuleModule } from "@textlint/config-loader";

/**
 * Load all rule modules from specified directory.
 * These are filtered by [extname]
 * @param {String} [rulesDir] Path to rules directory, may be relative. Defaults to `lib/rules`.
 * @param {String | String[]} [extnames] extension names
 * @returns {Object} Loaded rule modules by rule ids (file names).
 */
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
            const mod = await dynamicImport(path.join(rulesDirAbsolutePath, ruleFile), {
                parentModule: "textlint"
            });
            const ruleModule = moduleInterop(mod.exports?.default);
            if (!isTextlintRuleModule(ruleModule)) {
                throw new Error(`Loaded Module ${ruleFile} should export rule module`);
            }
            const ret: TextlintKernelRule = {
                rule: ruleModule,
                ruleId: withoutExt,
                options: true
            };
            return ret;
        })
    );
}
