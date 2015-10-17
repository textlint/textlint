# textlint [![Build Status](https://travis-ci.org/azu/textlint.svg)](https://travis-ci.org/azu/textlint)

The pluggable linting tool for text(plain text and markdown).

It is similar to [ESLint](http://eslint.org/ "ESLint").

## Installation

```
$ npm install textlint -g
```

## Usage

textlint has not default rule!!

Should use textlint with `--rule` or `--ruledir`.

![todo:lint result](http://monosnap.com/image/9FeIQr95kXjGPWFjZFRq6ZFG16YscF.png)

- [ ]  more more document

:information_source: See [examples/cli](examples/cli)

```sh
# install textlint rule
npm install --save-dev textlint-rule-no-todo
# use with `textlint-rule-no-todo` rule
# shorten `textlint-rule-no-todo` to `no-todo`.
textlint --rule no-todo README.md
```


## CLI

See command help.

```
$ textlint -h
  textlint [options] file.md [file.txt] [dir]
  
  Options:
    -h, --help                 Show help.
    -c, --config path::String  Use configuration from this file or sharable config.
    --rule [path::String]      Set rule package name and set all default rules to off.
    --rulesdir [path::String]  Set rules from this directory and set all default rules to off.
    -f, --format String        Use a specific output format. - default: stylish
    -v, --version              Outputs the version number.
    --ext [String]             Specify text file extensions.
    --no-color                 Enable color in piped output.
    -o, --output-file path::String  Enable report to be written to a file.
    --quiet                    Report errors only. - default: false
    --stdin                    Lint code provided on <STDIN>. - default: false
```

Allow to use with multiple rules.

```sh
$ textlint --rule no-todo --rule very-nice-rule README.md
```

### .textlintrc

`.textlintrc` is config file that is loaded as YAML, JSON or JS via [MoOx/rc-loader](https://github.com/MoOx/rc-loader "MoOx/rc-loader").

```
$ textlint --rule no-todo --rule very-nice-rule README.md
```

is equal to

```json
{
  "rules": {
    "no-todo": true,
    "very-nice-rule": true,
  }
}
```

The config object can define rule's option.

```json
{
  "rules": {
    "no-todo": false, // disable
    "very-nice-rule": {
        "key": "value"
    }
  }
}
```

Pass rule's options("key": "value") to `very-nice-rule`.

It mean that use the following format:

```js
{
  "rules": {
    "<rule-name>": true | false | object
  }
}
```

:information_source: See [examples/config-file](examples/config-file)

### Plugin

textlint plugin is a set of rules and rulesConfig.

To enable plugin, put the "plugin-name` into `.textlinrc`.

```js
// `.textlinrc`
{
    "plugins": [
        "plugin-name"
    ],
    // overwrite-plugins rules config
    // <plugin>/<rule>
    "rules": {
        "plugin-name/rule-name" : false
    }
}
```

:information_source: See [docs/plugin.md](docs/plugin.md)

### Rule list - [Collection of textlint rule](https://github.com/azu/textlint/wiki/Collection-of-textlint-rule "Collection of textlint rule · azu/textlint Wiki")

See [Collection of textlint rule · azu/textlint Wiki](https://github.com/azu/textlint/wiki/Collection-of-textlint-rule "Collection of textlint rule · azu/textlint Wiki").

If you create new rule, and add it to the wiki :)

### Built-in formatters

Currently, you can use "stylish" (defaults), "compact", "checkstyle", "jslint-xml", "junit", "tap", "pretty-error".

e.g.) use pretty-error.js

```
$ textlint -f pretty-error file.md
```

More detail in [azu/textlint-formatter](https://github.com/azu/textlint-formatter "azu/textlint-formatter").

## Use as node modules

You can use textlint as node modules.

```
$ npm install textlint --save-dev
```

Minimal usage:

```js
var TextLintEngine = require("textlint").TextLintEngine;
var engine = new TextLintEngine({
    rulePaths: ["path/to/rule-dir"]
});
var results = engine.executeOnFiles(["README.md"]);
console.log(results[0].filePath);// => "README.md"
// messages are `TextLintMessage` array.
console.log(results[0].messages);
/* 
[
    {
        id: "rule-name",
        message:"lint message",
        line: 1, // 1-based columns(TextLintMessage)
        column:1 // 1-based columns(TextLintMessage)
    }
]
 */
if (engine.isErrorResults(results)) {
    var output = engine.formatResults(results);
    console.log(output);
}
```

High level usage:

```js
var textlint = require("textlint").textlint;
textlint.setupRules({
    // rule-key : rule function(see docs/create-rules.md)
    "rule-key": function(context){
        var exports = {};
        exports[context.Syntax.Str] = function (node) {
            context.report(node, new context.RuleError("error message"));
        };
        return exports;
    }
});
var results = cliEngine.executeOnFiles(["README.md"]);
console.log(results[0].filePath);// => "README.md"
console.log(results[0].messages);// => [{message:"lint message"}]
```

More detail:

- See [docs/use-as-modules.md](docs/use-as-modules.md)

## FAQ: How to create rules?

Please see docs/

- [docs/txtnode.md](docs/txtnode.md)
    - What is is TxtNode?
- [docs/create-rules.md](docs/create-rules.md)
    - How to create rules?
    - Tutorial: creating `no-todo` rule.

## Use with XXX

- [nakajmg/gulp-textlint](https://github.com/nakajmg/gulp-textlint "nakajmg/gulp-textlint")

> gulp plugin for textlint.

- [1000ch/linter-textlint](https://github.com/1000ch/linter-textlint "1000ch/linter-textlint")

> The plugin for Atom Linter provides an interface to textlint.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT and

`lib/load-rules.js`, `util/traverse.js`, `cli.js`  are:

    ESLint
    Copyright (c) 2013 Nicholas C. Zakas. All rights reserved.
    https://github.com/eslint/eslint/blob/master/LICENSE

## Related Work

[SCG: TextLint](http://scg.unibe.ch/research/textlint "SCG: TextLint") is similar project.

[SCG: TextLint](http://scg.unibe.ch/research/textlint "SCG: TextLint")'s place is equal to my `textlint`(Fortuitously, project's name is the same too!).

![concept](http://monosnap.com/image/Gr9CGbkSjl1FXEL0LIWzNDAj3c24JT.png)

via [Natural Language Checking with Program Checking Tools](http://www.slideshare.net/renggli/text-lint "Natural Language Checking with Program Checking Tools")

## Acknowledgements

Thanks to [ESLint](http://eslint.org/ "ESLint").
