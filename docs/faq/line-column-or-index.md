# Have to use {line, column} or index

## For developer

- Related: [context.report(node, { index }): index-based report · Issue #134 · textlint/textlint](https://github.com/textlint/textlint/issues/134 "context.report(node, { index }): index-based report · Issue #134 · textlint/textlint")

### Bad Case

There is wrong that `column` doesn't consider line break.

```js
//  surrogate pair 
function stringToArray(value) {
    return value.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}

export default function (context) {
    let {Syntax, RuleError, report, getSource} = context;
    return {
        [Syntax.Str](node){
            const text = getSource(node);
            const strArray = stringToArray(text);
            for (let index = 0; index < strArray.length; index++) {
                const item = strArray[index];
                // ❌
                if (/\u274c/.test(item)) {
                    report(node, new RuleError("Use X insteadof \u274c", {
                        // This is wrong
                        column: index
                    }));
                }
            }
        }
    }
}
```

Input: 

```
string
❌
string
```

Result of TextLintMessage:

```json
{
   "message": "Use X insteadof ❌",
   "line": 1,
   "column": 7
}
```

Expected:

```json
{
   "message": "Use X insteadof ❌",
   "line": 2,
   "column": 1
}
```

You can use `index` instead of this.

### Good

```js
var paddingLocation = {
    line: 1,
    column: 2
};
report(node, new RuleError("message", {
    line: paddingLocation.line,
    column: paddingLocation.column
});
```

OR use "index" property

```
var paddingIndexValue = 1;
report(node, new RuleError("message", {
    index: paddingIndexValue
});
```

Fixed version:

```js
//  surrogate pair 
function stringToArray(value) {
    return value.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}

export default function (context) {
    let {Syntax, RuleError, report, getSource} = context;
    return {
        [Syntax.Str](node){
            const text = getSource(node);
            const strArray = stringToArray(text);
            for (let index = 0; index < strArray.length; index++) {
                const item = strArray[index];
                // ❌
                if (/\u274c/.test(item)) {
                    report(node, new RuleError("Use X insteadof \u274c", {
                        index: index
                    }));
                }
            }
        }
    }
}
```
