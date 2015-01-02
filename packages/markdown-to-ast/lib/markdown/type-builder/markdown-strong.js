// LICENSE : MIT
"use strict";

/*
 {
    "c": [
        {
            "c": "str",
            "type": "Str"
        }
    ],
    "type": "Strong"
    }
 */
module.exports = function (node, contents) {
    return '__' + contents + '__';
};