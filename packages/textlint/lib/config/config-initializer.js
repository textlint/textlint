// LICENSE : MIT
"use strict";

var _config;

function _load_config() {
    return _config = _interopRequireDefault(require("../config/config"));
}

var _logger;

function _load_logger() {
    return _logger = _interopRequireDefault(require("../util/logger"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Promise = require("bluebird");
var fs = require("fs");
var path = require("path");
var ObjectAssign = require("object-assign");
var isFile = require("is-file");
var readPkg = require("read-pkg");


/**
 * read package.json if found it
 * @param {string} dir
 * @returns {Promise.<Array.<String>>}
 */
var getTextlintDependencyNames = function getTextlintDependencyNames(dir) {
    return readPkg(dir).then(function (pkg) {
        var dependencies = pkg.dependencies || {};
        var devDependencies = pkg.devDependencies || {};
        var mergedDependencies = ObjectAssign({}, dependencies, devDependencies);
        var pkgNames = Object.keys(mergedDependencies);
        return pkgNames.filter(function (pkgName) {
            var ruleOrFilter = pkgName.indexOf((_config || _load_config()).default.FILTER_RULE_NAME_PREFIX) !== -1 || pkgName.indexOf((_config || _load_config()).default.RULE_NAME_PREFIX) !== -1;
            if (pkgName === "textlint-rule-helper") {
                return false;
            }
            return ruleOrFilter;
        });
    }).catch(function () {
        return [];
    });
};

/**
 * create object that fill with `defaultValue`
 * @param {Array} array
 * @param {*} defaultValue
 * @returns {Object}
 */
var arrayToObject = function arrayToObject(array, defaultValue) {
    var object = {};
    array.forEach(function (item) {
        object[item] = defaultValue;
    });
    return object;
};
/**
 * Initializer class for config of textlint.
 */
var init = {
    /**
     * Create .textlintrc file
     * @params {string} dir The directory of .textlintrc file
     * @returns {Promise.<number>} The exit code for the operation.
     */
    initializeConfig: function initializeConfig(dir) {
        return getTextlintDependencyNames(dir).then(function (pkgNames) {
            var rcFile = "." + (_config || _load_config()).default.CONFIG_FILE_NAME + "rc";
            var filePath = path.resolve(dir, rcFile);
            if (isFile(filePath)) {
                (_logger || _load_logger()).default.error(rcFile + " is already existed.");
                return Promise.resolve(1);
            }
            var filters = pkgNames.filter(function (pkgName) {
                return pkgName.indexOf((_config || _load_config()).default.FILTER_RULE_NAME_PREFIX) !== -1;
            }).map(function (filterName) {
                return filterName.replace((_config || _load_config()).default.FILTER_RULE_NAME_PREFIX, "");
            });
            var rules = pkgNames.filter(function (pkgName) {
                return pkgName.indexOf((_config || _load_config()).default.RULE_NAME_PREFIX) !== -1;
            }).map(function (filterName) {
                return filterName.replace((_config || _load_config()).default.RULE_NAME_PREFIX, "");
            });
            var defaultTextlintRc = {
                "filters": arrayToObject(filters, true),
                "rules": arrayToObject(rules, true)
            };
            var output = JSON.stringify(defaultTextlintRc, null, 2);
            fs.writeFileSync(filePath, output);
            return Promise.resolve(0);
        });
    }
};
module.exports = init;
//# sourceMappingURL=config-initializer.js.map