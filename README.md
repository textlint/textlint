# textlint [![Build Status](https://travis-ci.org/azu/textlint.svg)](https://travis-ci.org/azu/textlint)

The pluggable linting tool for text(plain text and markdown).

It is similar to [ESLint](http://eslint.org/ "ESLint").

## Installation

```
$ npm install textlint -g
```

## Usage

![todo:lint result](http://monosnap.com/image/9FeIQr95kXjGPWFjZFRq6ZFG16YscF.png)

- [ ]  more more document


```
$ textlint README.md
```

## CLI

See help.

```
$ textlint -h
textlint [options] file.md [file.txt] [dir]

Options:
  -h, --help                 Show help.
  --rulesdir [path::String]  Set rules from this directory and set all default rules to off.
  -f, --format String        Use a specific output format. - default: stylish
  -v, --version              Outputs the version number.
  --ext [String]             Specify text file extensions.
  --no-color                 Enable color in piped output.
  -o, --output-file path::String  Enable report to be written to a file.
  --quiet                    Report errors only. - default: false
  --stdin                    Lint code provided on <STDIN>. - default: false
```

### Built-in formatters

See [formatters/](lib/formatters).

Currently, you can use "stylish" (defaults), "compact", "checkstyle", "jslint-xml", "junit", "tap", "pretty-error".

e.g.) use pretty-error.js

```
$ textlint -f pretty-error file.md
```

## Use as node modules

You can use textlint as node modules.

```
$ npm install textlint --save-dev
```

Minimal usage:

```js
var CLIEngine = require("textlint").CLIEngine;
var cliEngine = new CLIEngine({
    rulesdir: ["path/to/rule-dir"]
});
var results = cliEngine.executeOnFiles(["README.md"]);
console.log(results[0].filePath);// => "README.md"
console.log(results[0].messages);// => [{message:"lint message"}]
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

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT

and

`lib/load-rules.js`, `util/traverse.js`, `cli.js` and formatters are:

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
