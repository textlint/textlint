# textlint [![Build Status](https://travis-ci.org/azu/textlint.svg)](https://travis-ci.org/azu/textlint)

The pluggable linting tool for text(plain text and markdown).

## Installation

```
npm install textlint
```

## Usage

![lint result](http://monosnap.com/image/9FeIQr95kXjGPWFjZFRq6ZFG16YscF.png)

- [ ] more more document!


```
textlint README.md
```

## CLI

See help.

```
textlint -h
```

## How to create rules?

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

## Related Work

[SCG: TextLint](http://scg.unibe.ch/research/textlint "SCG: TextLint") is similar project.

[SCG: TextLint](http://scg.unibe.ch/research/textlint "SCG: TextLint")'s place is equal to my `textlint`(Fortuitously, project name is equal too!).

![concept](http://monosnap.com/image/Gr9CGbkSjl1FXEL0LIWzNDAj3c24JT.png)

via [Natural Language Checking with Program Checking Tools](http://www.slideshare.net/renggli/text-lint "Natural Language Checking with Program Checking Tools")

## Acknowledgements

Thanks for [ESLint](http://eslint.org/ "ESLint").