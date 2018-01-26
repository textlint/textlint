// MIT © 2018 azu
"use strict";
const chalk = require("chalk");
const { dots } = require("cli-spinners");
const logUpdate = require("log-update");
const { exec, spawn } = require("child-process-promise");

const execRead = async (command, options) => {
    const { stdout } = await exec(command, options);

    return stdout.trim();
};

const unexecutedCommands = [];

/**
 *
 * @param {string} command
 * @param {string} cwd
 * @param {boolean} dry
 * @returns {Promise<void>}
 */
const execUnlessDry = async (command, { cwd, dry }) => {
    if (dry) {
        unexecutedCommands.push(`${command} # {cwd: ${cwd}}`);
    } else {
        await exec(command, { cwd });
    }
};

/**
 *
 * @param {string} command
 * @param {string[]} args
 * @param {string} cwd
 * @param {boolean} dry
 * @returns {Promise<void>}
 */
const spawnUnlessDry = async (command, args, { cwd, dry }) => {
    if (dry) {
        unexecutedCommands.push(`${command} # {cwd: ${cwd}}`);
    } else {
        const promise = spawn(command, args, { cwd });
        const childProcess = promise.childProcess;
        process.stdin.pipe(childProcess.stdin);
        childProcess.stdout.pipe(process.stdout);
        childProcess.stderr.pipe(process.stderr);
        await promise;
    }
};

const getUnexecutedCommands = () => {
    if (unexecutedCommands.length > 0) {
        return chalk`
      The following commands were not executed because of the {bold --dry} flag:
      {gray ${unexecutedCommands.join("\n")}}
    `;
    } else {
        return "";
    }
};

/**
 * @param {string} text
 */
const log = text => {
    console.log(`${chalk.green("✓")} ${text}`);
};

/**
 * @param {Promise<string>}promise
 * @param {string} title
 * @param {boolean} [isLongRunningTask]
 * @returns {Promise<*>}
 */
const logPromise = async (promise, title, isLongRunningTask = false) => {
    const { frames, interval } = dots;

    let index = 0;

    const inProgressMessage = `- this may take a few ${isLongRunningTask ? "minutes" : "seconds"}`;

    const id = setInterval(() => {
        index = ++index % frames.length;
        logUpdate(`${chalk.yellow(frames[index])} ${title} ${chalk.gray(inProgressMessage)}`);
    }, interval);

    try {
        const returnValue = await promise;

        clearInterval(id);

        logUpdate(`${chalk.green("✓")} ${title}`);
        logUpdate.done();

        return returnValue;
    } catch (error) {
        logUpdate.clear();

        throw error;
    }
};

const runYarnTask = async (args, { cwd, dry }) => {
    return spawnUnlessDry(`yarn`, args, { cwd, dry });
};

module.exports = {
    execRead,
    execUnlessDry,
    getUnexecutedCommands,
    runYarnTask,
    log,
    logPromise
};
