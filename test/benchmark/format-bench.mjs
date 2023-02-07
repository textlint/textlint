/* create "customSmallerIsBetter" format
[
    {
        "name": "My Custom Smaller Is Better Benchmark - CPU Load",
        "unit": "Percent",
        "value": 50
    },
    {
        "name": "My Custom Smaller Is Better Benchmark - Memory Used",
        "unit": "Megabytes",
        "value": 100,
        "range": "3",
        "extra": "Value for Tooltip: 25\nOptional Num #2: 100\nAnything Else!"
    }
]
 */
import * as fs from "fs";

/**
 * @type {import("./result.json")}
 */
const resultJSON = JSON.parse(fs.readFileSync("result.json", "utf8"));
const customResults = resultJSON.results.map((result) => {
    return {
        name: result.command,
        unit: "s",
        value: result.mean,
        range: `± ${result.max - result.min}`
    };
});
fs.writeFileSync("output.json", JSON.stringify(customResults, null, 4), "utf8");
