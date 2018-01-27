#!/usr/bin/env node

const chalk = require("chalk");
const inquirer = require("inquirer");
const getPackages = require("get-monorepo-packages");
const canNpmPublish = require("can-npm-publish").canNpmPublish;
const meow = require("meow");
const { execRead, log, logPromise, execUnlessDry, getUnexecutedCommands } = require("./utils/utils");
const { asyncMap, asyncFilter } = require("./utils/async-utils");
const cli = meow(
    `
    Usage
      $ textlint-scripts-release

    Options:
      --dry Enable dry run mode

    Examples
      $ textlint-scripts-release --dry
`,
    {
        autoVersion: true,
        autoHelp: true,
        flags: {
            dry: {
                type: "boolean"
            }
        }
    }
);

/**
 * publish packages to npm
 * @param {boolean} dry
 * @returns {Promise<void>}
 */
const release = async dry => {
    const projectDir = await execRead("git rev-parse --show-toplevel");
    const packages = getPackages(projectDir);
    const publishablePackages = await asyncFilter(packages, async pkg => {
        try {
            await canNpmPublish(pkg.location);
            return true;
        } catch (error) {
            return false;
        }
    });

    if (publishablePackages.length === 0) {
        return log("No need to publish.");
    }
    // confirm: npm publish
    const answers = await inquirer.prompt([
        {
            type: "confirm",
            name: "publish",
            message: `Do you publish these?
${publishablePackages.map(pkg => pkg.package.name).join(", ")}
`
        }
    ]);
    if (!answers["publish"]) {
        return log("No publish");
    }
    // npm publish
    await publishablePackages.reduce((promise, pkg) => {
        return promise.then(() => {
            const location = pkg.location;
            const task = execUnlessDry(`npm publish`, {
                cwd: location,
                dry
            });
            return logPromise(task, pkg.package.name);
        });
    }, Promise.resolve());

    console.log(
        chalk`
    {green.bold Publish successful!}
    ${getUnexecutedCommands()}
    Next there are a couple of manual steps:
    
    1. Check released packages
    2. Merge Pull Request 

  `.replace(/\n +/g, "\n")
    );
};

release(cli.flags.dry).catch(error => {
    console.error(error);
    process.exit(1);
});
