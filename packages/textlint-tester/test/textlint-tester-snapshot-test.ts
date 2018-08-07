// LICENSE : MIT
"use strict";

import { TextLintTester } from "../src/textlint-tester";

const tester = new TextLintTester({
    snapshotFileName: __filename
});
// No Error
const noTodoRule = require("textlint-rule-no-todo");
tester.run("no-error", noTodoRule, {
    snapshots: [
        {
            text: "This is all valid"
        },
        {
            text: `This is all valid
            
Multi-line text is tested`
        }
    ]
});
// Lint Message
tester.run("lint-message", noTodoRule, {
    snapshots: [
        {
            text: "TODO: test"
        },
        {
            text: `- [ ] plain text
            
THIS IS TODO.`
        }
    ]
});
const fixerRule = require("./fixtures/rule/fixer-rule-add.js");
tester.run("fix-message", fixerRule, {
    snapshots: [
        {
            text: "Fix test"
        },
        {
            text: "123\n" + "345"
        }
    ]
});
