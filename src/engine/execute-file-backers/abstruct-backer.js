// MIT © 2016 azu
"use strict";
/* eslint-disable */
export default class AbstractBacker {
    /**
     * @param {string} filePath
     * @returns {boolean}
     */
    shouldExecute({filePath}) {
        return true;
    }

    /**
     * @param {TextLintResult} result
     * @returns {boolean}
     */
    didExecute({result}) {
        return true;
    }

    /**
     * call when after all execution is completed
     */
    afterAll(){

    }
}
