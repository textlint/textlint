# textlint-plugin-html [![Build Status](https://travis-ci.org/textlint/textlint-plugin-html.svg?branch=master)](https://travis-ci.org/textlint/textlint-plugin-html)

Add HTML support for [textlint](https://github.com/textlint/textlint "textlint").

What is textlint plugin? Please see https://github.com/textlint/textlint/blob/master/docs/plugin.md


## Installation

    npm install textlint-plugin-html

## Usage

Manually add text plugin to do following:

```
{
    "plugins": [
        "html"
    ]
}
```

Lint HTML file with textlint

```
$ textlint index.html
```

## Tests

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
