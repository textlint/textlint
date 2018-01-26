#!/usr/bin/env node

const chalk = require("chalk");
const meow = require("meow");
const { execRead, log, logPromise, execUnlessDry, getUnexecutedCommands, runYarnTask } = require("./utils/utils");
const { asyncMap, asyncFilter } = require("./utils/async-utils");
const cli = meow(
    `
    Usage
      $ textlint-scripts-prepare-release

    Options:
      --dry Enable dry run mode

    Examples
      $ textlint-scripts-prepare-release --dry
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
 * prepare release
 * @param {boolean} dry
 * @returns {Promise<void>}
 */
const prepareRelease = async dry => {
    const currentBranch = await execRead("git rev-parse --abbrev-ref HEAD");
    if (currentBranch === "master") {
        return console.log("Don't run `textlint-script-prepare-release` in master branch");
    }
    const projectDir = await execRead("git rev-parse --show-toplevel");
    // version up && git commit && git tag
    await runYarnTask(["lerna", "publish", "--conventional-commits", "--changelog-preset=angular-all", "--skip-npm"], {
        cwd: projectDir,
        dry
    });
    console.log(
        chalk`
    {green.bold Prepare is successful!}
    ${getUnexecutedCommands()}
    
    Next there are a couple of manual steps:
    
    {bold.underline Step 1: Open Pull Request}

    1. $ git push
    2. Open Pull Request

    {bold.underline Step 2: Publish to npm}

    1. Verify every changes
    2. Release packages to npm
    
    {bold.underline Release command}
    
    $ yarn run release


  `.replace(/\n +/g, "\n")
    );
};

prepareRelease(cli.flags.dry).catch(error => {
    console.error(error);
    process.exit(1);
});
