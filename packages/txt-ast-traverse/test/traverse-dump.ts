// LICENSE : MIT
"use strict";
import { Controller } from "../src";
import { TxtParentNode } from "@textlint/ast-node-types";

export class Dumper {
    // [enter|leave, node type, parent node type]
    private logs: ["enter" | "leave", string, string | null][];

    constructor() {
        this.logs = [];
    }

    addLog(log: ["enter" | "leave", string, string | null]) {
        this.logs.push(log);
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
function dump(root: TxtParentNode) {
    const dumper = new Dumper();
    const controller = new Controller();
    controller.traverse(root, {
        enter(node, parent) {
            dumper.addLog(["enter", node.type, parent ? parent.type : null]);
        },
        leave(node, parent) {
            dumper.addLog(["leave", node.type, parent ? parent.type : null]);
        }
    });
    return dumper.result();
}

export { dump };
