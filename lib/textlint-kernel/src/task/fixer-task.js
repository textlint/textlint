// LICENSE : MIT
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var textlint_core_task_1 = require("./textlint-core-task");
var rule_creator_helper_1 = require("../core/rule-creator-helper");
var rule_context_1 = require("../core/rule-context");
var filter_rule_context_1 = require("../core/filter-rule-context");
var debug = require("debug")("textlint:TextLintCoreTask");
var TextLintCoreTask = /** @class */ (function (_super) {
    __extends(TextLintCoreTask, _super);
    /**
     * @param {Config} config
     * @param {string} [configBaseDir]
     * @param {TextlintKernelRule} fixerRule rules has fixer
     * @param {TextlintKernelFilterRule[]} filterRules filter rules and config set
     * @param {SourceCode} sourceCode
     */
    function TextLintCoreTask(_a) {
        var config = _a.config, configBaseDir = _a.configBaseDir, fixerRule = _a.fixerRule, filterRules = _a.filterRules, sourceCode = _a.sourceCode;
        var _this = _super.call(this) || this;
        _this.config = config;
        _this.configBaseDir = configBaseDir;
        _this.fixerRule = fixerRule;
        _this.filterRules = filterRules;
        _this.sourceCode = sourceCode;
        _this._setupRules();
        return _this;
    }
    TextLintCoreTask.prototype.start = function () {
        this.startTraverser(this.sourceCode);
    };
    TextLintCoreTask.prototype._setupRules = function () {
        var _this = this;
        // rule
        var sourceCode = this.sourceCode;
        var report = this.createReporter(sourceCode);
        var ignoreReport = this.createShouldIgnore();
        // setup "rules" field by using a single fixerRule
        debug("fixerRule", this.fixerRule);
        var ruleContext = new rule_context_1.default({
            ruleId: this.fixerRule.ruleId,
            ruleOptions: this.fixerRule.options,
            sourceCode: sourceCode,
            report: report,
            configBaseDir: this.configBaseDir
        });
        var ruleModule = rule_creator_helper_1.getFixer(this.fixerRule.rule);
        this.tryToAddListenRule(ruleModule, ruleContext, this.fixerRule.options);
        // setup "filters" field
        debug("filterRules", this.filterRules);
        this.filterRules.forEach(function (_a) {
            var ruleId = _a.ruleId, rule = _a.rule, options = _a.options;
            var ruleContext = new filter_rule_context_1.default({
                ruleId: ruleId,
                sourceCode: sourceCode,
                ignoreReport: ignoreReport
            });
            // "filters" rule is the same with "rules"
            var ruleModule = rule_creator_helper_1.getFilter(rule);
            _this.tryToAddListenRule(ruleModule, ruleContext, options);
        });
    };
    return TextLintCoreTask;
}(textlint_core_task_1.default));
exports.default = TextLintCoreTask;
