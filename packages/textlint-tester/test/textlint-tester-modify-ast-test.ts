import TextLintTester from "../src/index";

const tester = new TextLintTester();
const invalidRule = require("./fixtures/modify-ast-rule/invalid-rule");
tester.run("invalid rule: modify ast", invalidRule, {
    valid: ["text"]
});
