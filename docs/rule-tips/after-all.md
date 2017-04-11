# How to implement "after-all" in the rule?

> Is there any way to execute this after all checks are done?

textlint doesn't provide `after-all` hook.
But you can write following:

```js
// Async Task return a promise.
const callAsync = (text) => {
    // do something by async
    return Promise.resolve(text);
};

module.exports = (context) => {
    const { Syntax, getSource } = context;
    const promiseQueue = [];
    return {
        [Syntax.Str](node) {
            const text = getSource(node);
            // add the promise object to queue
            promiseQueue.push(callAsync(text));
        },
        // call this method at the end
        // Syntax.Document <-> Syntax.Document:exit
        // https://github.com/textlint/textlint/blob/master/docs/rule.md
        [`${Syntax.Document}:exit`](){
            // Note: textlint wait for `Promise.all` is resolved.
            return Promise.all(promiseQueue).then((...responses) => {
                // do something
            }).then(() => {
                // after-all !
            });
        }
    };
};
```

## Related Issues

- [Rule: Tear down · Issue #266 · textlint/textlint](https://github.com/textlint/textlint/issues/266#issuecomment-293192017 "Rule: Tear down · Issue #266 · textlint/textlint")
