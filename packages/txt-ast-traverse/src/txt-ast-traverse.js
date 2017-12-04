// LICENSE : MIT
"use strict";
function isNode(node) {
    if (node == null) {
        return false;
    }
    return typeof node === "object" && (typeof node.type === "string" || typeof node.t === "string");
}
function TxtElement(node, path, wrap, ref) {
    this.node = node;
    this.path = path;
    this.wrap = wrap;
    this.ref = ref;
}

const BREAK = {},
    SKIP = {},
    REMOVE = {};
const VisitorOption = {
    Break: BREAK,
    Skip: SKIP,
    Remove: REMOVE
};
class Controller {
    __willStartTraverse(root, visitor) {
        this.__current = null;
        this.visitor = visitor;
        this.root = root;
        this.__worklist = [];
        this.__leavelist = [];
    }

    __execute(callback, element) {
        let result;

        result = undefined;

        const previous = this.__current;
        this.__current = element;
        if (callback) {
            result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
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
    parents() {
        let i, iz;
        // first node is sentinel
        const result = [];
        for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {
            result.push(this.__leavelist[i].node);
        }
        return result;
    }

    /**
     * Gets current node during traverse.
     * @returns {TxtNode}
     * @public
     */
    current() {
        return this.__current.node;
    }

    traverse(root, visitor) {
        let ret;
        this.__willStartTraverse(root, visitor);

        const sentinel = {};

        // reference
        const worklist = this.__worklist;
        const leavelist = this.__leavelist;

        // initialize
        worklist.push(new TxtElement(root, null, null, null));
        leavelist.push(new TxtElement(null, null, null, null));

        while (worklist.length) {
            let element = worklist.pop();

            if (element === sentinel) {
                element = leavelist.pop();

                ret = this.__execute(visitor.leave, element);

                if (ret === BREAK) {
                    return;
                }
                continue;
            }

            if (element.node) {
                ret = this.__execute(visitor.enter, element);

                if (ret === BREAK) {
                    return;
                }

                worklist.push(sentinel);
                leavelist.push(element);

                if (ret === SKIP) {
                    continue;
                }

                const node = element.node;
                const nodeType = element.wrap || node.type;
                const candidates = Object.keys(node);

                let current = candidates.length;
                while ((current -= 1) >= 0) {
                    const key = candidates[current];
                    const candidate = node[key];
                    if (!candidate) {
                        continue;
                    }

                    if (Array.isArray(candidate)) {
                        let current2 = candidate.length;
                        while ((current2 -= 1) >= 0) {
                            if (!candidate[current2]) {
                                continue;
                            }
                            if (isNode(candidate[current2])) {
                                element = new TxtElement(candidate[current2], [key, current2], null, null);
                            } else {
                                continue;
                            }
                            worklist.push(element);
                        }
                    } else if (isNode(candidate)) {
                        worklist.push(new TxtElement(candidate, key, null, null));
                    }
                }
            }
        }
    }
}

function traverse(root, visitor) {
    const controller = new Controller();
    return controller.traverse(root, visitor);
}
export { Controller, traverse, VisitorOption };
