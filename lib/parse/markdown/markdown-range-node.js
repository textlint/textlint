// LICENSE : MIT
"use strict";
// e.g.) range :[0,3]
/**
 * compute location from node
 * @param {TxtNode} node
 * @returns {object} location object
 */
module.exports = function (node, startIndex) {
    if (!node.loc) {
        return node;
    }
    return {
        range: [startIndex, startIndex + node.raw.length]
    };
};