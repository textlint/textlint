const path = require("path");
const shell = require("shelljs");
const testRootDirectory = path.join(__dirname, "..", "test");
if (!shell.which("grasp")) {
    shell.echo("Need http://www.graspjs.com/");
    shell.exit(1);
}
// textlint.setupRules({}, {}) => const options
function rewriteSetupRuleWithOption() {
    const ruleAndRuleOptionPattern =
        "textlint.setupRules({ $ruleId: $rule }, { $ruleId: $ruleOption });";
    const ruleAndRuleOptionPatternExpected = `const rule = { 
    ruleId: {{ruleId}}, 
    rule: {{rule}},
    options: {{ruleOption}}
};`;
    shell.exec(
        `grasp --in-place -r -e '${ruleAndRuleOptionPattern}' --replace '${ruleAndRuleOptionPatternExpected}' ${testRootDirectory}`
    );
}
// textlint.setupRules({}) => const options
function rewriteSetupRule() {
    const ruleAndRuleOptionPattern = "textlint.setupRules({ $ruleId: $rule });";
    const ruleAndRuleOptionPatternExpected = `const rule = { 
    ruleId: {{ruleId}}, 
    rule: {{rule}}
};`;
    shell.exec(
        `grasp --in-place -r -e '${ruleAndRuleOptionPattern}' --replace '${ruleAndRuleOptionPatternExpected}' ${testRootDirectory}`
    );
}

// textlint.setupFilterRules({}, {}) => const options
function rewriteSetupFilterRuleWithOption() {
    const ruleAndRuleOptionPattern =
        "textlint.setupFilterRules({ $ruleId: $rule }, { $ruleId: $ruleOption });";
    const ruleAndRuleOptionPatternExpected = `const filterRule = { 
    ruleId: {{ruleId}}, 
    rule: {{rule}},
    options: {{ruleOption}}
};`;
    shell.exec(
        `grasp --in-place -r -e '${ruleAndRuleOptionPattern}' --replace '${ruleAndRuleOptionPatternExpected}' ${testRootDirectory}`
    );
}
// textlint.setupRules({}) => const options
function rewriteSetupFilterRule() {
    const ruleAndRuleOptionPattern = "textlint.setupFilterRules({ $ruleId: $rule });";
    const ruleAndRuleOptionPatternExpected = `const filterRule = { 
    ruleId: {{ruleId}}, 
    rule: {{rule}}
};`;
    shell.exec(
        `grasp --in-place -r -e '${ruleAndRuleOptionPattern}' --replace '${ruleAndRuleOptionPatternExpected}' ${testRootDirectory}`
    );
}
// textlint.lintMarkdown("text") => textlint.lintText(text, options);
function rewriteLintMarkdown() {
    const lintMarkdownPattern = `textlint.lintMarkdown( $text )`;
    const lintMarkdownPatternExpected = `textlint.lintText({{text}}, Object.assign({}, options, { ext: ".md" })`;
    shell.exec(
        `grasp --in-place -r -e '${lintMarkdownPattern}' --replace '${lintMarkdownPatternExpected}' ${testRootDirectory}`
    );
}
// textlint.lintFile(filePath) => textlint.lintFile(text, options);
function rewriteLintFile() {
    const pattern = `textlint.lintFile( $filePath )`;
    const expected = `const text = fs.readFileSync( {{filePath}}, "utf-8");
    const ext = path.extname({{filePath}});
    textlint.lintText(text, Object.assign({}, options, { ext })`;
    shell.exec(`grasp --in-place -r -e '${pattern}' --replace '${expected}' ${testRootDirectory}`);
}
