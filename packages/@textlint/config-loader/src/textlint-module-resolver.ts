import * as path from "path";
import { PackageNamePrefix } from "./package-prefix";
import { createFullPackageName } from "./textlint-package-name-util";
// @ts-ignore
import tryResolve from "try-resolve";

export interface ConfigModulePrefix {
    CONFIG_PACKAGE_PREFIX: string;
    FILTER_RULE_NAME_PREFIX: string;
    RULE_NAME_PREFIX: string;
    RULE_PRESET_NAME_PREFIX: string;
    PLUGIN_NAME_PREFIX: string;
}

/**
 * This class aim to resolve textlint's package name and get the module path.
 *
 * Define
 *
 * - `package` is npm package
 * - `module` is package's main module
 *
 * ## Support
 *
 * - textlint-rule-*
 * - textlint-preset-*
 * - textlint-plugin-*
 * - textlint-config-*
 */
export class TextLintModuleResolver {
    private baseDirectory: string;
    private moduleCache = new Map<string, string>();

    constructor(config: { rulesBaseDirectory?: string }) {
        /**
         * @type {string} baseDirectory for resolving
         */
        this.baseDirectory = config && config.rulesBaseDirectory ? config.rulesBaseDirectory : "";
    }
    tryResolveModuleName = (
        moduleName: string
    ): {
        moduleName: string;
        filePath: string;
    } | null => {
        const cachedFilePath = this.moduleCache.get(moduleName);
        if (cachedFilePath) {
            return {
                moduleName,
                filePath: cachedFilePath
            };
        }
        const ret: string | undefined = tryResolve(moduleName);
        if (ret) {
            this.moduleCache.set(moduleName, ret);
            return {
                moduleName,
                filePath: ret
            };
        }
        return null;
    };
    /**
     * Take package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    resolveRulePackageName(packageName: string): {
        moduleName: string;
        filePath: string;
    } {
        const baseDir = this.baseDirectory;
        const fullPackageName = createFullPackageName(PackageNamePrefix.rule, packageName);
        // <rule-name> or textlint-rule-<rule-name>
        const resultFullPackageName = this.tryResolveModuleName(path.join(baseDir, fullPackageName));
        if (resultFullPackageName) {
            return resultFullPackageName;
        }
        const resultPackageName = this.tryResolveModuleName(path.join(baseDir, packageName));
        if (resultPackageName) {
            return resultPackageName;
        }
        throw new ReferenceError(`Failed to load textlint's rule module: "${packageName}" is not found.
See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md
`);
    }

    /**
     * Take package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    resolveFilterRulePackageName(packageName: string): {
        moduleName: string;
        filePath: string;
    } {
        const baseDir = this.baseDirectory;
        const fullPackageName = createFullPackageName(PackageNamePrefix.filterRule, packageName);
        // <rule-name> or textlint-filter-rule-<rule-name> or @scope/<rule-name>
        const resultFullPackageName = this.tryResolveModuleName(path.join(baseDir, fullPackageName));
        if (resultFullPackageName) {
            return resultFullPackageName;
        }
        const resultPackageName = this.tryResolveModuleName(path.join(baseDir, packageName));
        if (resultPackageName) {
            return resultPackageName;
        }
        throw new ReferenceError(`Failed to load textlint's filter rule module: "${packageName}" is not found.
See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md
`);
    }

    /**
     * Take package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    resolvePluginPackageName(packageName: string): {
        moduleName: string;
        filePath: string;
    } {
        const baseDir = this.baseDirectory;
        const fullPackageName = createFullPackageName(PackageNamePrefix.plugin, packageName);
        // <plugin-name> or textlint-plugin-<rule-name>
        const resultFullPackageName = this.tryResolveModuleName(path.join(baseDir, fullPackageName));
        if (resultFullPackageName) {
            return resultFullPackageName;
        }
        const resultPackageName = this.tryResolveModuleName(path.join(baseDir, packageName));
        if (resultPackageName) {
            return resultPackageName;
        }
        throw new ReferenceError(`Failed to load textlint's plugin module: "${packageName}" is not found.
See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md
`);
    }

    /**
     * Take package name, and return path to module.
     * @param {string} packageName
     * The user must specify preset- prefix to these `packageName`.
     * @returns {string} return path to module
     */
    resolvePresetPackageName(packageName: string): {
        moduleName: string;
        filePath: string;
    } {
        const baseDir = this.baseDirectory;
        const PREFIX = PackageNamePrefix.rulePreset;
        /* Implementation Note

        preset name is defined in config file:
        In the case, `packageName` is "preset-gizmo"
        TextLintModuleResolver resolve "preset-gizmo" to "textlint-rule-preset-gizmo"
        {
            "rules": {
                "preset-gizmo": {
                    "ruleA": false
                }
            }
        }
         */
        // preset-<name> or textlint-rule-preset-<name>
        // @scope/preset-<name> or @scope/textlint-rule-preset-<name>
        const packageNameWithoutPreset = packageName
            .replace(/^preset-/, "")
            .replace(/^@([^/]+)\/preset-(.*)$/, `@$1/$2`);
        const fullPackageName = createFullPackageName(PREFIX, packageNameWithoutPreset);
        const fullFullPackageName = `${PREFIX}${packageNameWithoutPreset}`;
        // textlint-rule-preset-<preset-name> or @scope/textlint-rule-preset-<preset-name>
        const resultFullPresetPackageName = this.tryResolveModuleName(path.join(baseDir, fullFullPackageName));
        if (resultFullPresetPackageName) {
            return resultFullPresetPackageName;
        }
        // <preset-name>
        const resultPresetPackageName = this.tryResolveModuleName(path.join(baseDir, packageNameWithoutPreset));
        if (resultPresetPackageName) {
            return resultPresetPackageName;
        }
        // <rule-name>
        const resultFullPackageName = this.tryResolveModuleName(path.join(baseDir, fullPackageName));
        if (resultFullPackageName) {
            return resultFullPackageName;
        }
        // <package-name>
        const resultPackageName = this.tryResolveModuleName(path.join(baseDir, packageName));
        if (resultPackageName) {
            return resultPackageName;
        }
        throw new ReferenceError(`Failed to load textlint's preset module: "${packageName}" is not found.
See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md
`);
    }

    /**
     * Take Config package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    resolveConfigPackageName(packageName: string): string {
        const baseDir = this.baseDirectory;
        const fullPackageName = createFullPackageName(PackageNamePrefix.config, packageName);
        // <plugin-name> or textlint-config-<rule-name>
        const pkgPath = tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
        if (!pkgPath) {
            throw new ReferenceError(`Failed to load textlint's config module: "${packageName}" is not found.
See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md
`);
        }
        return pkgPath;
    }
}
