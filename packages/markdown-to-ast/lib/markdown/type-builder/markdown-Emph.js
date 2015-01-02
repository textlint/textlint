// LICENSE : MIT
"use strict";
/*
    {
        "c": [
            {
                "c": "text",
                "type": "Str"
            }
        ],
        "type": "Emphasis"
    }

    FIXME: we have no way of detect *text* or _text_
 */
module.exports = function (node, contents) {
    return "*" + contents + "*";
};