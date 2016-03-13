// LICENSE : MIT
"use strict";
// dictionary dictionary
import RuleMap from "./processor-map";
export default class ProcessorMap extends RuleMap {
    hasRuleAtLeastOne() {
        return this.getAllRuleNames().length > 0;
    }

    keys() {
        return this.getAllRuleNames();
    }

    get(key) {
        return this.getRule(key);
    }

    toJSON() {
        return this.getAllRules();
    }

    has(key) {
        return this.isDefinedRule(key);
    }

    set(key, value) {
        this.set(key, value);
    }

    clear() {
        this.resetRules();
    }
}
