// LICENSE : MIT
"use strict";
import { TextlintPackageNamePrefix } from "@textlint/utils";

import fs from "node:fs";
import path from "node:path";
import { Logger } from "../util/logger.js";

const isFile = (filePath: string) => {
    try {
        return fs.statSync(filePath).isFile();
    } catch (error) {
        return false;
    }
};

/**
 * read package.json if found it
 * @param {string} dir
 * @returns {Promise.<Array.<String>>}
 */
const getTextlintDependencyNames = async (dir: string): Promise<Array<string>> => {
    const { readPackageUp } = await import("read-package-up");
    return readPackageUp({
        cwd: dir
    })
        .then((result) => {
            const pkg = result?.packageJson;
            const dependencies = pkg?.dependencies ?? {};
            const devDependencies = pkg?.devDependencies ?? {};
            const mergedDependencies = Object.assign({}, dependencies, devDependencies);
            const pkgNames = Object.keys(mergedDependencies);
            return pkgNames.filter((pkgName) => {
                const ruleOrFilterOrPlugin =
                    pkgName.indexOf(TextlintPackageNamePrefix.filterRule) !== -1 ||
                    pkgName.indexOf(TextlintPackageNamePrefix.rule) !== -1 ||
                    pkgName.indexOf(TextlintPackageNamePrefix.plugin) !== -1;
                if (pkgName === "textlint-rule-helper") {
                    return false;
                }
                return ruleOrFilterOrPlugin;
            });
        })
        .catch(() => {
            return [];
        });
};

/**
 * create object that fill with `defaultValue`
 * @param {Array} array
 * @param {*} defaultValue
 * @returns {Object}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const arrayToObject = (array: Array<string>, defaultValue: any): any => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const object: any = {};
    array.forEach((item) => {
        object[item] = defaultValue;
    });
    return object;
};

export interface CreateConfigFileOption {
    // create .textlint in the `dir`
    dir: string;
    // display log message if it is `true`
    verbose: boolean;
}

/**
 * Create .textlintrc file
 * @params {string} dir The directory of .textlintrc file
 * @returns {Promise.<number>} The exit code for the operation.
 */
export const createConfigFile = async (options: CreateConfigFileOption) => {
    const dir = options.dir;
    return getTextlintDependencyNames(dir).then((pkgNames) => {
        const rcFile = `.textlintrc.json`;
        const filePath = path.resolve(dir, rcFile);
        if (isFile(filePath)) {
            Logger.error(`${rcFile} is already existed.`);
            return Promise.resolve(1);
        }
        const filters = pkgNames
            .filter((pkgName) => {
                return pkgName.indexOf(TextlintPackageNamePrefix.filterRule) !== -1;
            })
            .map((filterName) => {
                return filterName.replace(TextlintPackageNamePrefix.filterRule, "");
            });
        const rules = pkgNames
            .filter((pkgName) => {
                return pkgName.indexOf(TextlintPackageNamePrefix.rule) !== -1;
            })
            .map((filterName) => {
                return filterName.replace(TextlintPackageNamePrefix.rule, "");
            });
        const plugins = pkgNames
            .filter((pkgName) => {
                return pkgName.indexOf(TextlintPackageNamePrefix.plugin) !== -1;
            })
            .map((filterName) => {
                return filterName.replace(TextlintPackageNamePrefix.plugin, "");
            });
        const defaultTextlintRc = {
            plugins: arrayToObject(plugins, true),
            filters: arrayToObject(filters, true),
            rules: arrayToObject(rules, true)
        };
        const output = JSON.stringify(defaultTextlintRc, null, 2);
        fs.writeFileSync(filePath, output);
        if (options.verbose) {
            Logger.log(`${rcFile} is created.`);
        }
        return Promise.resolve(0);
    });
};
