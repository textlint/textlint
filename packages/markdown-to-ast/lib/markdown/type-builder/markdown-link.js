// LICENSE : MIT
"use strict";
/*
    [label](http://example.com)
    =>
    {
        "destination": "http://example.com",
        "label": [
            {
                // inline_content
            }
        ],
        "raw": "label",
        "type": "Link"
    }


    [label](http://example.com "title")
    =>
    {
        "destination": "http://example.com",
        "title": "title",
        "label": [
            // inline_content
        ],
        "raw": "label",
        "type": "Link"
    }
 */
module.exports = function link(node, contents) {
    if (typeof node.title === "undefined") {
        return '[' + contents + '](' + node.destination + ')';
    } else {
        return '[' + contents + '](' + node.destination + ' "' + node.title + '")';
    }
};