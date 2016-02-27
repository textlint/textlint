// LICENSE : MIT
'use strict';
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const Config = require('../config/config');

// Public Interface
/**
 * Initializer class for config of textlint.
 */
const init = {
    /**
     * Create .textlintrc file in the current working directory
     * @returns {int} The exit code for the operation.
     */
    initializeConfig() {
        let rcFile = "." + Config.CONFIG_FILE_NAME + "rc";
        let output = JSON.stringify({"rules":{}}, null, '  ');
        const filePath = path.resolve(process.cwd(), rcFile);
        try {
            if (fs.existsSync(filePath)) {
                throw new Error(`${ rcFile } is already existed.`);
            }
            fs.writeFileSync(filePath, output);
        } catch (error) {
            console.error(error.message);
            return Promise.resolve(1);
        }
        return Promise.resolve(0);
    }
};
module.exports = init;
