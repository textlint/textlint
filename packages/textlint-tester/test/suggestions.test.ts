// LICENSE : MIT
"use strict";
import TextLintTester from "../src/index";
import type { TextlintRuleReporter } from "@textlint/types";

const tester = new TextLintTester();

// Rule that reports suggestions
const ruleWithSuggestions: TextlintRuleReporter = (context) => {
    const { Syntax, RuleError, report, fixer } = context;
    return {
        [Syntax.Str](node) {
            if (node.value === "problem") {
                report(
                    node,
                    new RuleError("found error", {
                        suggestions: [
                            {
                                id: "suggestion-1",
                                message: "use alternative",
                                fix: fixer.replaceTextRange([0, 1], "X")
                            },
                            {
                                id: "suggestion-2",
                                message: "use another",
                                fix: fixer.replaceTextRange([0, 1], "Y")
                            }
                        ]
                    })
                );
            }
        }
    };
};

tester.run("rule-with-suggestions", ruleWithSuggestions, {
    valid: ["text with no errors"],
    invalid: [
        {
            text: "problem",
            errors: [
                {
                    message: "found error",
                    suggestions: [
                        {
                            id: "suggestion-1",
                            message: "use alternative",
                            output: "X"
                        },
                        {
                            id: "suggestion-2",
                            message: "use another",
                            output: "Y"
                        }
                    ]
                }
            ]
        }
    ]
});

// Rule that reports suggestions without custom message
const ruleWithSuggestionsNoMessage: TextlintRuleReporter = (context) => {
    const { Syntax, RuleError, report, fixer } = context;
    return {
        [Syntax.Str](node) {
            if (node.value === "bad") {
                report(
                    node,
                    new RuleError("found error", {
                        suggestions: [
                            {
                                id: "s1",
                                message: "fix to A",
                                fix: fixer.replaceTextRange([0, 1], "A")
                            },
                            {
                                id: "s2",
                                message: "fix to B",
                                fix: fixer.replaceTextRange([0, 1], "B")
                            }
                        ]
                    })
                );
            }
        }
    };
};

tester.run("rule-with-suggestions-no-message", ruleWithSuggestionsNoMessage, {
    valid: ["ok"],
    invalid: [
        {
            text: "bad",
            errors: [
                {
                    message: "found error",
                    suggestions: [
                        {
                            id: "s1",
                            message: "fix to A",
                            output: "A"
                        },
                        {
                            id: "s2",
                            message: "fix to B",
                            output: "B"
                        }
                    ]
                }
            ]
        }
    ]
});

// Rule that reports no suggestions
const ruleWithoutSuggestions: TextlintRuleReporter = (context) => {
    const { Syntax, RuleError, report } = context;
    return {
        [Syntax.Str](node) {
            if (node.value === "problem") {
                report(node, new RuleError("found error"));
            }
        }
    };
};

tester.run("rule-without-suggestions", ruleWithoutSuggestions, {
    valid: ["text with no errors"],
    invalid: [
        {
            text: "problem",
            errors: [
                {
                    message: "found error"
                }
            ]
        }
    ]
});

// Rule with suggestions using range
const ruleWithSuggestionsRange: TextlintRuleReporter = (context) => {
    const { Syntax, RuleError, report, fixer } = context;
    return {
        [Syntax.Str](node) {
            if (node.value === "problematic") {
                report(
                    node,
                    new RuleError("found error", {
                        suggestions: [
                            {
                                id: "fix-all",
                                message: "fix all",
                                fix: fixer.replaceTextRange([0, node.value.length], "FIXED")
                            }
                        ]
                    })
                );
            }
        }
    };
};

tester.run("rule-with-suggestions-range", ruleWithSuggestionsRange, {
    valid: ["good"],
    invalid: [
        {
            text: "problematic",
            errors: [
                {
                    message: "found error",
                    suggestions: [
                        {
                            id: "fix-all",
                            message: "fix all",
                            range: [0, 11],
                            output: "FIXED"
                        }
                    ]
                }
            ]
        }
    ]
});

// Rule with single suggestion
const ruleWithSingleSuggestion: TextlintRuleReporter = (context) => {
    const { Syntax, RuleError, report, fixer } = context;
    return {
        [Syntax.Str](node) {
            if (node.value === "typo") {
                report(
                    node,
                    new RuleError("typo found", {
                        suggestions: [
                            {
                                id: "correct-typo",
                                message: "correct to 'correct'",
                                fix: fixer.replaceTextRange([0, 5], "correct")
                            }
                        ]
                    })
                );
            }
        }
    };
};

tester.run("rule-with-single-suggestion", ruleWithSingleSuggestion, {
    valid: ["correct"],
    invalid: [
        {
            text: "typo",
            errors: [
                {
                    message: "typo found",
                    suggestions: [
                        {
                            id: "correct-typo",
                            message: "correct to 'correct'",
                            output: "correct"
                        }
                    ]
                }
            ]
        }
    ]
});

// Rule with multiple errors, each with suggestions
const ruleWithMultipleErrorsWithSuggestions: TextlintRuleReporter = (context) => {
    const { Syntax, RuleError, report, fixer } = context;
    return {
        [Syntax.Str](node) {
            if (node.value === "foo") {
                report(
                    node,
                    new RuleError("Don't use 'foo'", {
                        suggestions: [
                            {
                                id: "use-bar",
                                message: "Use 'bar' instead",
                                fix: fixer.replaceTextRange([0, 3], "bar")
                            }
                        ]
                    })
                );
            } else if (node.value === "baz") {
                report(
                    node,
                    new RuleError("Don't use 'baz'", {
                        suggestions: [
                            {
                                id: "use-qux",
                                message: "Use 'qux' instead",
                                fix: fixer.replaceTextRange([0, 3], "qux")
                            }
                        ]
                    })
                );
            }
        }
    };
};

tester.run("rule-with-multiple-errors-with-suggestions", ruleWithMultipleErrorsWithSuggestions, {
    valid: ["bar", "qux"],
    invalid: [
        {
            text: "foo",
            errors: [
                {
                    message: "Don't use 'foo'",
                    suggestions: [
                        {
                            id: "use-bar",
                            message: "Use 'bar' instead",
                            output: "bar"
                        }
                    ]
                }
            ]
        },
        {
            text: "baz",
            errors: [
                {
                    message: "Don't use 'baz'",
                    suggestions: [
                        {
                            id: "use-qux",
                            message: "Use 'qux' instead",
                            output: "qux"
                        }
                    ]
                }
            ]
        }
    ]
});
