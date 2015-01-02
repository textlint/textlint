// LICENSE : MIT
"use strict";

/*
    {
            "t": "Code",
            "c": "code",
            "type": "Code"
    }
 */
module.exports = function code(node, contents) {
    return '`' + contents + '`';
};