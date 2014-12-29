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
    - What's is Text's node?
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

`lib/load-rules.js` , `util/traverse.js`, `cli.js` and formatters are:

    ESLint
    Copyright (c) 2013 Nicholas C. Zakas. All rights reserved.

## Acknowledgements

Many thanks for [ESLint](http://eslint.org/ "ESLint").