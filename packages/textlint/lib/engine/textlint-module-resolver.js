// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = require("assert");
var path = require("path");
var tryResolve = require("try-resolve");
var validateConfigConstructor = function validateConfigConstructor(ConfigConstructor) {
    assert(ConfigConstructor.CONFIG_PACKAGE_PREFIX && ConfigConstructor.FILTER_RULE_NAME_PREFIX && ConfigConstructor.RULE_NAME_PREFIX && ConfigConstructor.RULE_PRESET_NAME_PREFIX && ConfigConstructor.PLUGIN_NAME_PREFIX);
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

var TextLintModuleResolver = function () {
    /**
     *
     * @param {Config|*} ConfigConstructor config constructor like object
     * It has static property like CONFIG_PACKAGE_PREFIX etc...
     * @param {string} [baseDirectory]
     * @constructor
     */
    function TextLintModuleResolver(ConfigConstructor) {
        var baseDirectory = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

        _classCallCheck(this, TextLintModuleResolver);

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


    _createClass(TextLintModuleResolver, [{
        key: "resolveRulePackageName",
        value: function resolveRulePackageName(packageName) {
            var baseDir = this.baseDirectory;
            var PREFIX = this.RULE_NAME_PREFIX;
            var fullPackageName = "" + PREFIX + packageName;
            // <rule-name> or textlint-rule-<rule-name>
            var pkgPath = tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
            if (!pkgPath) {
                throw new ReferenceError("Failed to load textlint's rule module: \"" + packageName + "\" is not found.\nSee FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md\n");
            }
            return pkgPath;
        }

        /**
         * Take package name, and return path to module.
         * @param {string} packageName
         * @returns {string} return path to module
         */

    }, {
        key: "resolveFilterRulePackageName",
        value: function resolveFilterRulePackageName(packageName) {
            var baseDir = this.baseDirectory;
            var PREFIX = this.FILTER_RULE_NAME_PREFIX;
            var fullPackageName = "" + PREFIX + packageName;
            // <rule-name> or textlint-filter-rule-<rule-name>
            var pkgPath = tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
            if (!pkgPath) {
                throw new ReferenceError("Failed to load textlint's filter rule module: \"" + packageName + "\" is not found.\nSee FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md\n");
            }
            return pkgPath;
        }

        /**
         * Take package name, and return path to module.
         * @param {string} packageName
         * @returns {string} return path to module
         */

    }, {
        key: "resolvePluginPackageName",
        value: function resolvePluginPackageName(packageName) {
            var baseDir = this.baseDirectory;
            var PREFIX = this.PLUGIN_NAME_PREFIX;
            var fullPackageName = "" + PREFIX + packageName;
            // <plugin-name> or textlint-plugin-<rule-name>
            var pkgPath = tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
            if (!pkgPath) {
                throw new ReferenceError("Failed to load textlint's plugin module: \"" + packageName + "\" is not found.\nSee FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md\n");
            }
            return pkgPath;
        }

        /**
         * Take package name, and return path to module.
         * @param {string} packageName
         * @returns {string} return path to module
         */

    }, {
        key: "resolvePresetPackageName",
        value: function resolvePresetPackageName(packageName) {
            var baseDir = this.baseDirectory;
            var PREFIX = this.RULE_PRESET_NAME_PREFIX;
            var fullPackageName = "" + PREFIX + packageName;

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
            var packageNameWithoutPreset = packageName.replace(/^preset\-/, "");
            var fullFullPackageName = "" + PREFIX + packageNameWithoutPreset;
            // preset-<preset-name> or textlint-rule-preset-<preset-name>
            var pkgPath = tryResolve(path.join(baseDir, fullFullPackageName)) || tryResolve(path.join(baseDir, packageNameWithoutPreset)) ||
            // <preset-name> or textlint-rule-preset-<rule-name>
            tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
            if (!pkgPath) {
                throw new ReferenceError("Failed to load textlint's preset module: \"" + packageName + "\" is not found.\nSee FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md\n");
            }
            return pkgPath;
        }

        /**
         * Take Config package name, and return path to module.
         * @param {string} packageName
         * @returns {string} return path to module
         */

    }, {
        key: "resolveConfigPackageName",
        value: function resolveConfigPackageName(packageName) {
            var baseDir = this.baseDirectory;
            var PREFIX = this.CONFIG_PACKAGE_PREFIX;
            var fullPackageName = "" + PREFIX + packageName;
            // <plugin-name> or textlint-config-<rule-name>
            var pkgPath = tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
            if (!pkgPath) {
                throw new ReferenceError("Failed to load textlint's config module: \"" + packageName + "\" is not found.\nSee FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md\n");
            }
            return pkgPath;
        }
    }]);

    return TextLintModuleResolver;
}();

exports.default = TextLintModuleResolver;
//# sourceMappingURL=textlint-module-resolver.js.map