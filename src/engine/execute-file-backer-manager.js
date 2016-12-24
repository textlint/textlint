// MIT © 2016 azu
"use strict";
const Promise = require("bluebird");
export default class ExecuteFileBackerManager {
    /**
     * create MessageProcessManager with backers
     * @param {function()[]} backers
     */
    constructor(backers = []) {
        this._backers = backers;
    }

    /**
     * @param {AbstractBacker} backer
     */
    add(backer) {
        this._backers.push(backer);
    }

    /**
     * @param {AbstractBacker} backer
     */
    remove(backer) {
        const index = this._backers.indexOf(backer);
        if (index !== -1) {
            this._backers.splice(index, 1);
        }
    }

    /**
     * process `messages` with registered processes
     * @param {string[]} files
     * @param {function(filePath: string):Promise} executeFile
     * @returns {Promise.<TextLintResult[]>}
     */
    process(files, executeFile) {
        const unExecutedResults = [];
        const resultPromises = files.filter((filePath) => {
            const shouldExecute = this._backers.every((backer) => {
                return backer.shouldExecute({filePath});
            });
            // add fake unExecutedResults for un-executed file.
            if (!shouldExecute) {
                unExecutedResults.push(this._createFakeResult(filePath));
            }
            return shouldExecute;
        }).map((filePath) => {
            return executeFile(filePath).then(result => {
                this._backers.forEach((backer) => {
                    backer.didExecute({result});
                });
                return result;
            });
        }).concat(unExecutedResults);
        // wait all resolved, and call afterAll
        return Promise.all(resultPromises).then(results => {
            this._backers.forEach((backer) => {
                backer.afterAll();
            });
            return results;
        });
    }

    /**
     * create fake result object
     * @param {string} filePath
     * @returns {TextLintResult}
     * @private
     */
    _createFakeResult(filePath) {
        return {
            filePath,
            messages: []
        };
    }
}
