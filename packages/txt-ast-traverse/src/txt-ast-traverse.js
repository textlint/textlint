// LICENSE : MIT
"use strict";
function isNode(node) {
    if (node == null) {
        return false;
    }
    return typeof node === 'object' && (typeof node.type === 'string' || typeof node.t === 'string');
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
        var previous, result;

        result = undefined;

        previous = this.__current;
        this.__current = element;
        if (callback) {
            result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
        }
        this.__current = previous;

        return result;
    }

    traverse(root, visitor) {

        this.__willStartTraverse(root, visitor);

        var sentinel = {};

        // reference
        var worklist = this.__worklist;
        var leavelist = this.__leavelist;

        // initialize
        worklist.push(new TxtElement(root, null, null, null));
        leavelist.push(new TxtElement(null, null, null, null));

        while (worklist.length) {
            var element = worklist.pop();

            if (element === sentinel) {
                element = leavelist.pop();

                var ret = this.__execute(visitor.leave, element);

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

                var node = element.node;
                var nodeType = element.wrap || node.type;
                var candidates = Object.keys(node);

                var current = candidates.length;
                while ((current -= 1) >= 0) {
                    var key = candidates[current];
                    var candidate = node[key];
                    if (!candidate) {
                        continue;
                    }

                    if (Array.isArray(candidate)) {
                        var current2 = candidate.length;
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
    var controller = new Controller();
    return controller.traverse(root, visitor);
}
export {
    traverse,
    VisitorOption
    };