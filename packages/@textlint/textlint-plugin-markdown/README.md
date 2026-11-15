# @textlint/textlint-plugin-markdown

Markdown support for [textlint](https://github.com/textlint/textlint "textlint").

## Installation

    npm install @textlint/textlint-plugin-markdown

## Usage

Built-in support on textlint.
No need configuration.

------

Following config is set by default.

```
{
    "plugins": {
        "@textlint/markdown": true
    }
}
```

## Options

- `extensions`: `string[]`
    - Additional file extensions for markdown
    
For example, if you want to treat [MDX](https://github.com/mdx-js/mdx) as markdown, put following config to `.textlintrc`    

```json5
{
    "plugins": {
        "@textlint/markdown": {
            "extensions": [".mdx"]
        }
    }
}
```


- `cjkFriendlyEmphasis`: `boolean`
    - Default: `false`
    - Recognize emphasis, strong emphasis, and strikethrough next to CJK punctuation, as the [CommonMark CJK-friendly Amendments](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md) define
    - Enable it when your renderer does the same, such as VitePress and Rspress (`markdown.cjkFriendlyEmphasis`)

For example, `**強調。**この文` is plain text in CommonMark, and it is strong emphasis with this option.

```json5
{
    "plugins": {
        "@textlint/markdown": {
            "cjkFriendlyEmphasis": true
        }
    }
}
```

The AST does not record this option.
A rule whose behavior depends on it has its own option, so enable it in the rule too.

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
