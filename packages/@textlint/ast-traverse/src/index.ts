// LICENSE : MIT
"use strict";
import type { AnyTxtNode, TxtNode, TxtParentNode } from "@textlint/ast-node-types";

/**
 * is TxtNode?
 */
function isNode(node: unknown): node is TxtNode {
    if (node == null) {
        return false;
    }
    if (typeof node !== "object") {
        return false;
    }
    const obj = node as Record<string, unknown>;
    return typeof obj.type === "string" || typeof obj.t === "string";
}

export class TxtElement {
    constructor(public node: AnyTxtNode | null) {}
}

const BREAK = {};
const SKIP = {};
const VisitorOption = {
    Break: BREAK,
    Skip: SKIP
};

const SENTINEL = {} as AnyTxtNode;

class Controller {
    private __worklist!: AnyTxtNode[];
    private __leavelist!: (AnyTxtNode | null)[];
    private __current!: null | AnyTxtNode;

    private __willStartTraverse() {
        this.__current = null;
        this.__worklist = [];
        this.__leavelist = [];
    }

    private __execute(
        callback: ((this: Controller, current: AnyTxtNode, parent: TxtParentNode) => unknown) | undefined,
        node: AnyTxtNode
    ) {
        let result = undefined;

        const previous = this.__current;
        this.__current = node;
        if (callback) {
            const parentNode = this.__leavelist[this.__leavelist.length - 1] as TxtParentNode;
            result = callback.call(this, node, parentNode);
        }
        this.__current = previous;

        return result;
    }

    /**
     * Gets parent nodes of current node.
     * The parent nodes are returned in order from the closest parent to the outer ones.
     * Current node is {@link current}.
     * @returns {Array}
     * @public
     */
    parents(): TxtNode[] {
        const result: TxtNode[] = [];
        for (let i = 1, iz = this.__leavelist.length; i < iz; ++i) {
            const node = this.__leavelist[i];
            if (node) {
                result.push(node);
            }
        }
        return result;
    }

    /**
     * Gets current node during traverse.
     * @returns {TxtNode|null}
     * @public
     */
    current(): TxtNode | null {
        return this.__current ?? null;
    }

    /**
     * Traverse AST with visitor
     * @param {TxtParentNode} root
     * @param {Visitor} visitor
     */
    traverse(root: TxtParentNode, visitor: Visitor) {
        let ret;
        this.__willStartTraverse();

        const worklist = this.__worklist;
        const leavelist = this.__leavelist;

        worklist.push(root);
        leavelist.push(null);

        while (worklist.length) {
            const node = worklist.pop() as AnyTxtNode;
            if (node === SENTINEL) {
                const element = leavelist.pop();
                if (!element) {
                    continue;
                }
                ret = this.__execute(visitor.leave, element);
                if (ret === BREAK) {
                    return;
                }
                continue;
            }

            ret = this.__execute(visitor.enter, node);
            if (ret === BREAK) {
                return;
            }

            worklist.push(SENTINEL);
            leavelist.push(node);

            if (ret === SKIP) {
                continue;
            }

            const nodeRecord = node as unknown as Record<string, unknown>;
            const candidates = Object.keys(node);
            let current = candidates.length;
            while ((current -= 1) >= 0) {
                const candidate = nodeRecord[candidates[current]];
                if (!candidate || typeof candidate !== "object") {
                    continue;
                }
                if (Array.isArray(candidate)) {
                    let current2 = candidate.length;
                    while ((current2 -= 1) >= 0) {
                        const child = candidate[current2];
                        if (child && isNode(child)) {
                            worklist.push(child);
                        }
                    }
                } else if (isNode(candidate)) {
                    worklist.push(candidate);
                }
            }
        }
    }
}

export type Visitor = {
    enter?(node: TxtNode, parent?: TxtParentNode): unknown | void;

    leave?(node: TxtNode, parent?: TxtParentNode): unknown | void;
};

function traverse(root: TxtParentNode, visitor: Visitor) {
    const controller = new Controller();
    return controller.traverse(root, visitor);
}

export { Controller, traverse, VisitorOption };
