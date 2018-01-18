const fs = require("fs");
const path = require("path");
module.exports = [
    {
        filePath: path.join(__dirname, "double.md"),
        output: fs.readFileSync(path.join(__dirname, "double-fixed.md"), "utf-8"),
        applyingMessages: [
            {
                message: "Unexpected foo.",
                severity: 2,
                line: 5,
                column: 1,
                ruleId: "foo",
                fix: {
                    range: [36, 40],
                    text: "5th line"
                }
            },
            {
                message: "Unexpected bar.",
                severity: 2,
                line: 6,
                column: 1,
                ruleId: "foo",
                fix: {
                    range: [40, 44],
                    text: "6th line"
                }
            }
        ],
        remainingMessages: []
    }
];
