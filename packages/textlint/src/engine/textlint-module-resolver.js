// LICENSE : MIT
"use strict";
const assert = require("assert");
const path = require("path");
const tryResolve = require("try-resolve");
const validateConfigConstructor = (ConfigConstructor) => {
    assert(ConfigConstructor.CONFIG_PACKAGE_PREFIX &&
        ConfigConstructor.FILTER_RULE_NAME_PREFIX &&
        ConfigConstructor.RULE_NAME_PREFIX &&
        ConfigConstructor.RULE_PRESET_NAME_PREFIX &&
        ConfigConstructor.PLUGIN_NAME_PREFIX);
};
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
export default class TextLintModuleResolver {
    /**
     *
     * @param {Config|*} ConfigConstructor config constructor like object
     * It has static property like CONFIG_PACKAGE_PREFIX etc...
     * @param {string} [baseDirectory]
     * @constructor
     */
    constructor(ConfigConstructor, baseDirectory = "") {
        validateConfigConstructor(ConfigConstructor);
        /**
         * @type {string} config package prefix
         */
        this.CONFIG_PACKAGE_PREFIX = ConfigConstructor.CONFIG_PACKAGE_PREFIX;
        /**
         * @type {string} rule package's name prefix
         */
        this.RULE_NAME_PREFIX = ConfigConstructor.RULE_NAME_PREFIX;
        /**
         * @type {string} filter rule package's name prefix
         */
        this.FILTER_RULE_NAME_PREFIX = ConfigConstructor.FILTER_RULE_NAME_PREFIX;
        /**
         * @type {string} rule preset package's name prefix
         */
        this.RULE_PRESET_NAME_PREFIX = ConfigConstructor.RULE_PRESET_NAME_PREFIX;
        /**
         * @type {string} plugins package's name prefix
         */
        this.PLUGIN_NAME_PREFIX = ConfigConstructor.PLUGIN_NAME_PREFIX;

        /**
         * @type {string} baseDirectory for resolving
         */
        this.baseDirectory = baseDirectory;
    }

    /**
     * Take package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    resolveRulePackageName(packageName) {
        const baseDir = this.baseDirectory;
        const PREFIX = this.RULE_NAME_PREFIX;
        const fullPackageName = `${PREFIX}${packageName}`;
        // <rule-name> or textlint-rule-<rule-name>
        const pkgPath = tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
        if (!pkgPath) {
            throw new ReferenceError(`Failed to load textlint's rule module: "${packageName}" is not found.
See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md
`);
        }
        return pkgPath;
    }

    /**
     * Take package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    resolveFilterRulePackageName(packageName) {
        const baseDir = this.baseDirectory;
        const PREFIX = this.FILTER_RULE_NAME_PREFIX;
        const fullPackageName = `${PREFIX}${packageName}`;
        // <rule-name> or textlint-filter-rule-<rule-name>
        const pkgPath = tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
        if (!pkgPath) {
            throw new ReferenceError(`Failed to load textlint's filter rule module: "${packageName}" is not found.
See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md
`);
        }
        return pkgPath;
    }

    /**
     * Take package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    resolvePluginPackageName(packageName) {
        const baseDir = this.baseDirectory;
        const PREFIX = this.PLUGIN_NAME_PREFIX;
        const fullPackageName = `${PREFIX}${packageName}`;
        // <plugin-name> or textlint-plugin-<rule-name>
        const pkgPath = tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
        if (!pkgPath) {
            throw new ReferenceError(`Failed to load textlint's plugin module: "${packageName}" is not found.
See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md
`);
        }
        return pkgPath;
    }

    /**
     * Take package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    resolvePresetPackageName(packageName) {
        const baseDir = this.baseDirectory;
        const PREFIX = this.RULE_PRESET_NAME_PREFIX;
        const fullPackageName = `${PREFIX}${packageName}`;

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
        // <preset-name> or textlint-rule-preset-<rule-name>
        const packageNameWithoutPreset = packageName.replace(/^preset\-/, "");
        const fullFullPackageName = `${PREFIX}${packageNameWithoutPreset}`;
        // preset-<preset-name> or textlint-rule-preset-<preset-name>
        const pkgPath = tryResolve(path.join(baseDir, fullFullPackageName)) ||
            tryResolve(path.join(baseDir, packageNameWithoutPreset)) ||
            // <preset-name> or textlint-rule-preset-<rule-name>
            tryResolve(path.join(baseDir, fullPackageName)) ||
            tryResolve(path.join(baseDir, packageName));
        if (!pkgPath) {
            throw new ReferenceError(`Failed to load textlint's preset module: "${packageName}" is not found.
See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md
`);
        }
        return pkgPath;
    }


    /**
     * Take Config package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    resolveConfigPackageName(packageName) {
        const baseDir = this.baseDirectory;
        const PREFIX = this.CONFIG_PACKAGE_PREFIX;
        const fullPackageName = `${PREFIX}${packageName}`;
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

