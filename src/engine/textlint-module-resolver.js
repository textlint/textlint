// LICENSE : MIT
"use strict";
const assert = require("assert");
const path = require("path");
const tryResolve = require("try-resolve");
const validateConfigConstructor = (ConfigConstructor) => {
    assert(ConfigConstructor.CONFIG_PACKAGE_PREFIX &&
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
 */
export default class TextLintModuleResolver {
    /**
     *
     * @param {Config} ConfigConstructor config constructor like object
     * It has static property like CONFIG_PACKAGE_PREFIX etc...
     * @param {string} [baseDirectory]
     * @constructor
     */
    constructor(ConfigConstructor, baseDirectory = "") {
        validateConfigConstructor(ConfigConstructor);
        /**
         * @return {string} config package prefix
         */
        this.CONFIG_PACKAGE_PREFIX = ConfigConstructor.CONFIG_PACKAGE_PREFIX;
        /**
         * @return {string} rule package's name prefix
         */
        this.RULE_NAME_PREFIX = ConfigConstructor.RULE_NAME_PREFIX;
        /**
         * @return {string} rule preset package's name prefix
         */
        this.RULE_PRESET_NAME_PREFIX = ConfigConstructor.RULE_PRESET_NAME_PREFIX;
        /**
         * @return {string} plugins package's name prefix
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
            throw new ReferenceError(`Failure to load textlint's rule module: "${packageName}" is not found.`);
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
            throw new ReferenceError(`Failure to load textlint's plugin module: "${packageName}" is not found.`);
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
        // <preset-name> or textlint-rule-preset-<rule-name> or preset-<preset-name>
        const packageNameWithoutPreset = packageName.replace(/^preset\-/, "");
        const fullFullPackageName = `${PREFIX}${packageNameWithoutPreset}`;
        // preset-<preset-name> or textlint-rule-preset-<preset-name>
        const pkgPath = tryResolve(path.join(baseDir, fullFullPackageName)) ||
            tryResolve(path.join(baseDir, packageNameWithoutPreset)) ||
            // <preset-name> or textlint-rule-preset-<rule-name>
            tryResolve(path.join(baseDir, fullPackageName)) ||
            tryResolve(path.join(baseDir, packageName));
        if (!pkgPath) {
            throw new ReferenceError(`Failure to load textlint's preset module: "${packageName}" is not found.`);
        }
        return pkgPath;
    }
}

