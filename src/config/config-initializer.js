// LICENSE : MIT
'use strict';
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const Config = require('../config/config');
const Logger = require("../util/logger");
// Public Interface
/**
 * Initializer class for config of textlint.
 */
const init = {
    /**
     * Create .textlintrc file
     * @params {string} dir The directory of .textlintrc file
     * @returns {int} The exit code for the operation.
     */
    initializeConfig(dir) {
        let rcFile = "." + Config.CONFIG_FILE_NAME + "rc";
        let output = JSON.stringify({"rules": {}}, null, 2);
        const filePath = path.resolve(dir, rcFile);
        try {
            if (fs.existsSync(filePath)) {
                throw new Error(`${ rcFile } is already existed.`);
            }
            fs.writeFileSync(filePath, output);
        } catch (error) {
            Logger.error(error.message);
            return Promise.resolve(1);
        }
        return Promise.resolve(0);
    }
};
module.exports = init;
