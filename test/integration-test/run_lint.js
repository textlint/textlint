#!/usr/bin/env node
/* eslint-disable no-console */
const shell = require("shelljs");
const path = require("path");
const assert = require("assert");
const JSON5 = require("json5");
const toPackageList = require("textlintrc-to-pacakge-list");
const fs = require("fs");
module.exports = function runLint(projectDirName, sourceTarget) {
    const currentDir = __dirname;
    assert.ok(projectDirName !== undefined, "projectDirName is not defined");
    assert.ok(sourceTarget !== undefined, "sourceTarget is not defined");
    const projectDirPath = path.resolve(currentDir, projectDirName);
    const textlintBin = path.join(__dirname, "node_modules", ".bin", "textlint");

    function echo(log) {
        const blue = "\u001b[34m";
        const reset = "\u001b[0m";
        console.log(blue, log, reset);
    }

    function mapRuleWithVersion(pkg, packageList) {
        const deps = pkg.dependencies || {};
        const devDeps = pkg.devDependencies || {};
        return packageList.map((rulePackageName) => {
            const version = deps[rulePackageName] || devDeps[rulePackageName];
            return `${rulePackageName}@${version}`;
        });
    }

    // main
    shell.set("-e");
    shell.cd(projectDirPath);
    echo(`⭐️ Project: ${projectDirName}`);
    const textlintrcText = fs.readFileSync(path.resolve(projectDirPath, ".textlintrc"), "utf-8");
    const textlintrc = JSON5.parse(textlintrcText);
    const packageList = toPackageList(textlintrc);
    const pkg = require(path.resolve(projectDirPath, "package.json"));
    echo("📦 Install modules....");
    const packageListWithVersions = mapRuleWithVersion(pkg, packageList);
    console.log(packageListWithVersions.join(", "));
    shell.exec("yarn --pure-lockfile --ignore-scripts --silent", { silent: true });
    echo("📝 Run textlint");
    const NODE_PATH = path.join(projectDirPath, "node_modules");
    process.env.NODE_PATH = NODE_PATH;
    shell.exec(`${textlintBin} --rules-base-directory "${NODE_PATH}" ${sourceTarget}`);
    echo("💚 Pass textlint");
    echo("--------------------");
};
