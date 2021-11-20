// LICENSE : MIT
"use strict";
import assert from "assert";
import path from "path";
import { cli } from "../../src/";

describe("parsing", function () {
    it("should lint all files without error", function () {
        const ruleDir = `--rulesdir ${path.join(__dirname, "fixtures/no-error-rules")}`;
        const testDir = path.join(__dirname, "fixtures/input");
        return cli.execute(`${ruleDir} ${testDir}`).then((result) => {
            assert.equal(result, 0);
        });
    });
});
