// LICENSE : MIT
"use strict";
import * as controller from "../lib/txt-ast-traverse.js";
class Dumper {
    constructor() {
        this.logs = [];
    }

    addLog(str) {
        this.logs.push(str);
    }

    /**
     * Return stored logs.
     * Each logs contain node.type.
     * @returns {{string,string}[]} result is tuple array
     */
    result() {
        return this.logs;
    }
}
/**
 * Traverse nodes, then return result of logs.
 * @param root start node for traversing.
 * @returns {{string,string}[]}
 */
function dump(root) {
    var dumper = new Dumper();
    controller.traverse(root, {
        enter(node) {
            dumper.addLog(["enter", node.type]);
        },
        leave(node) {
            dumper.addLog(["leave", node.type]);
        }
    });
    return dumper.result();
}
export default dump;
