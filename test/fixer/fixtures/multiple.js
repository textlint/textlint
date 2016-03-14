const fs = require("fs");
const path = require("path");
module.exports = [
    {
        filePath: path.join(__dirname, "single.md"),
        output: fs.readFileSync(path.join(__dirname, "single-fixed.md"), "utf-8"),
        applyingMessages: [
            {
                message: "Unexpected foo.",
                severity: 2,
                line: 5,
                column: 9,
                ruleId: "foo",
                fix: {
                    range: [44, 48],
                    text: ""
                }
            }
        ],
        remainingMessages: []
    },
    {
        filePath: path.join(__dirname, "multiple.md"),
        output: fs.readFileSync(path.join(__dirname, "multiple-fixed.md"), "utf-8"),
        applyingMessages: [
            // 1st
            {
                message: "Unexpected foo.",
                severity: 2,
                line: 1,
                column: 1,
                ruleId: "foo",
                fix: {
                    range: [0, 3],
                    text: "1th"
                }
            },
            {
                message: "Unexpected bar.",
                severity: 2,
                line: 1,
                column: 4,
                ruleId: "foo",
                fix: {
                    range: [4, 7],
                    text: "line"
                }
            },
            // 3th
            {
                message: "Unexpected foo.",
                severity: 2,
                line: 3,
                column: 1,
                ruleId: "foo",
                fix: {
                    range: [26, 29],
                    text: "1th"
                }
            },
            {
                message: "Unexpected bar.",
                severity: 2,
                line: 3,
                column: 4,
                ruleId: "foo",
                fix: {
                    range: [30, 33],
                    text: "line"
                }
            },

            // 6th
            {
                message: "Unexpected foo.",
                severity: 2,
                line: 7,
                column: 1,
                ruleId: "foo",
                fix: {
                    range: [51, 54],
                    text: "7th"
                }
            },
            {
                message: "Unexpected bar.",
                severity: 2,
                line: 7,
                column: 4,
                ruleId: "foo",
                fix: {
                    range: [55, 58],
                    text: "line"
                }
            }
        ],
        remainingMessages: []
    }
];
