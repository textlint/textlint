// LICENSE : MIT
"use strict";

/*
    {
        "destination": "http://example.com/a.png",
        "label": [
            {
                "c": "text",
                "type": "Str"
            }
        ],
        "type": "Image"
    }
 */
module.exports = function (node, contennts) {
    return "![" + contennts + "](" + node.destination + ")";
};
