// LICENSE : MIT
"use strict";
import assert from "power-assert";
import {createEntities} from "../../src/engine/textlint-module-loader";
describe("textlint-module-loader", function () {
    describe("#createEntities", function () {
        it("should define rules of plugin", function () {
            const pluginName = "configurable-plugin";
            const rules = require("./fixtures/configurable-plugin/index").rules;
            const entities = createEntities(rules, pluginName);
            assert.deepEqual(entities, [
                [`${pluginName}/configurable-rule`, require("./fixtures/configurable-plugin/rules/configurable-rule")],
                [`${pluginName}/overwrited-rule`, require("./fixtures/configurable-plugin/rules/configurable-rule")]
            ]);
        });
    });
});
