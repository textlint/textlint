# Formatter

Pass following object to reporter module .

```js
{
    results: [
        {
            filePath: "./myfile.js",
            messages: [
                {
                    ruleId: "semi",
                    line: 1,
                    column: 23,
                    message: "Expected a semicolon."
                }
            ]
        }
    ]
}
```