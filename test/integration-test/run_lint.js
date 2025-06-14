#!/usr/bin/env node
/* eslint-disable no-console */
import shell from "shelljs";
import assert from "node:assert";
import JSON5 from "json5";
import { listPackageNames } from "textlintrc-to-package-list";
import fs from "node:fs";
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const toPackageList = listPackageNames;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function runLint(projectDirName, sourceTarget) {
    const currentDir = __dirname;
    assert.ok(projectDirName !== undefined, "projectDirName is not defined");
    assert.ok(sourceTarget !== undefined, "sourceTarget is not defined");
    const projectDirPath = path.resolve(currentDir, projectDirName);
    const textlintBin = path.resolve(currentDir, "../../node_modules/.bin/textlint");

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
    const pkgText = fs.readFileSync(path.resolve(projectDirPath, "package.json"), "utf-8");
    const pkg = JSON.parse(pkgText);
    echo("📦 Install modules....");
    const packageListWithVersions = mapRuleWithVersion(pkg, packageList);
    console.log(packageListWithVersions.join(", "));
    shell.exec("npm install --no-save --no-package-lock --ignore-scripts --silent", { silent: true });
    echo("📝 Run textlint");
    const NODE_PATH = path.join(projectDirPath, "node_modules");
    process.env.NODE_PATH = NODE_PATH;
    shell.exec(`${textlintBin} --rules-base-directory "${NODE_PATH}" ${sourceTarget}`);
    echo("💚 Pass textlint");
    echo("--------------------");
};
