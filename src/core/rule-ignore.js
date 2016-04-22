// LICENSE : MIT
"use strict";
class RuleIgnore {
    constructor(range) {
        this.ignoreRange = range;
    }

    toString() {
        return JSON.stringify({
            ignore: this.ignoreRange
        });
    }
}
module.exports = RuleIgnore;
