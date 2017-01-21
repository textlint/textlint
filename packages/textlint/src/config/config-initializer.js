// LICENSE : MIT
"use strict";
const Promise = require("bluebird");
const fs = require("fs");
const path = require("path");
const ObjectAssign = require("object-assign");
const isFile = require("is-file");
const readPkg = require("read-pkg");
import Config from "../config/config";
import Logger from "../util/logger";

/**
 * read package.json if found it
 * @param {string} dir
 * @returns {Promise.<Array.<String>>}
 */
const getTextlintDependencyNames = (dir) => {
    return readPkg(dir).then(pkg => {
        const dependencies = pkg.dependencies || {};
        const devDependencies = pkg.devDependencies || {};
        const mergedDependencies = ObjectAssign({}, dependencies, devDependencies);
        const pkgNames = Object.keys(mergedDependencies);
        return pkgNames.filter(pkgName => {
            const ruleOrFilter = pkgName.indexOf(Config.FILTER_RULE_NAME_PREFIX) !== -1 || pkgName.indexOf(Config.RULE_NAME_PREFIX) !== -1;
            if (pkgName === "textlint-rule-helper") {
                return false;
            }
            return ruleOrFilter;
        });
    }).catch(() => {
        return [];
    });
};

/**
 * create object that fill with `defaultValue`
 * @param {Array} array
 * @param {*} defaultValue
 * @returns {Object}
 */
const arrayToObject = (array, defaultValue) => {
    const object = {};
    array.forEach(item => {
        object[item] = defaultValue;
    });
    return object;
};
/**
 * Initializer class for config of textlint.
 */
const init = {
    /**
     * Create .textlintrc file
     * @params {string} dir The directory of .textlintrc file
     * @returns {Promise.<number>} The exit code for the operation.
     */
    initializeConfig(dir) {
        return getTextlintDependencyNames(dir).then(pkgNames => {
            const rcFile = "." + Config.CONFIG_FILE_NAME + "rc";
            const filePath = path.resolve(dir, rcFile);
            if (isFile(filePath)) {
                Logger.error(`${ rcFile } is already existed.`);
                return Promise.resolve(1);
            }
            const filters = pkgNames.filter(pkgName => {
                return pkgName.indexOf(Config.FILTER_RULE_NAME_PREFIX) !== -1;
            }).map(filterName => {
                return filterName.replace(Config.FILTER_RULE_NAME_PREFIX, "");
            });
            const rules = pkgNames.filter(pkgName => {
                return pkgName.indexOf(Config.RULE_NAME_PREFIX) !== -1;
            }).map(filterName => {
                return filterName.replace(Config.RULE_NAME_PREFIX, "");
            });
            const defaultTextlintRc = {
                "filters": arrayToObject(filters, true),
                "rules": arrayToObject(rules, true)
            };
            const output = JSON.stringify(defaultTextlintRc, null, 2);
            fs.writeFileSync(filePath, output);
            return Promise.resolve(0);
        });
    }
};
module.exports = init;
