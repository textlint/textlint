// LICENSE : MIT
"use strict";
const fileTraverse = require("./traverse");
const debug = require("debug")("textlint:find-util");
/**
 * filter files by config
 * @param files
 * @param {string[]} extensions extensions array
 */
export function findFiles(files, extensions) {
    const processed = [];
    // sync
    fileTraverse({
        files: files,
        extensions: extensions,
        exclude: false
    }, filename => {
        debug(`Processing ${ filename }`);
        processed.push(filename);
    });
    return processed;
}
