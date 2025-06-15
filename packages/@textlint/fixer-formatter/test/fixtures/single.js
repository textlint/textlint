const fs = require("node:fs");
const path = require("node:path");
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
    }
];
