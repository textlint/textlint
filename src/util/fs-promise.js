// LICENSE : MIT
"use strict";
const fs = require("fs");
const Promise = require("bluebird");
export function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf-8", (error, result) => {
            if(error) {
                return reject(error);
            }
            resolve(result);
        });
    });
}
