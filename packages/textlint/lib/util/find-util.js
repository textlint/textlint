// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.findFiles = findFiles;
var fileTraverse = require("./traverse");
var debug = require("debug")("textlint:find-util");
/**
 * filter files by config
 * @param files
 * @param {string[]} extensions extensions array
 */
function findFiles(files, extensions) {
    var processed = [];
    // sync
    fileTraverse({
        files: files,
        extensions: extensions,
        exclude: false
    }, function (filename) {
        debug("Processing " + filename);
        processed.push(filename);
    });
    return processed;
}
//# sourceMappingURL=find-util.js.map