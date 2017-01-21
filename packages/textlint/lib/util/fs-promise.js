// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.readFile = readFile;
var fs = require("fs");
var Promise = require("bluebird");
function readFile(filePath) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, "utf-8", function (error, result) {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
}
//# sourceMappingURL=fs-promise.js.map