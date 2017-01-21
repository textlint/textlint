const fs = require("fs");
const path = require("path");
module.exports = [
    {
        filePath: path.join(__dirname, "remaining.md"),
        output: fs.readFileSync(path.join(__dirname, "remaining-fixed.md"), "utf-8"),
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
        remainingMessages: [
            {
                message: "Unexpected XXX.",
                severity: 2,
                line: 6,
                column: 9,
                ruleId: "XXX"
            }
        ]
    }
];
