// LICENSE : MIT
"use strict";
/*
  {

        "children": [
            {
                // inline_content
            }
        ],
        "list_data": {
            "type": "Bullet",
            "bullet_char": "-",
            "padding": 2,
            "marker_offset": 0
        },
        "tight": true,
        "type": "ListItem"
    }


* marker_offset 0
* padding 2
    * marker_offset 4
 */

function space(number) {
    if (number === 0) {
        return "";
    }
    return (new Array(number)).join(" ");
}
module.exports = function listItem(node, contents) {
    var listData = node.list_data;
    if (listData == null) {
        return contents;
    }
    return space(listData.bullet_char) + listData.bullet_char + space(listData.padding) + contents;

};