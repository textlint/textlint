# @textlint/textlint-plugin-markdown

Markdown support for [textlint](https://github.com/textlint/textlint "textlint").

## Installation

```sh
npm install @textlint/textlint-plugin-markdown
```

## Usage

Built-in support on textlint.
No need configuration.

---

Following config is set by default.

```json
{
  "plugins": {
    "@textlint/markdown": true
  }
}
```

## Options

- `extensions`: `string[]` (default: `[]`)
  - Additional file extensions for markdown.
- `cjkFriendly`: `boolean` (default: `false`)
  - Enable CJK-friendly emphasis and GFM strikethrough parsing with the [`remark-cjk-friendly`](https://github.com/tats-u/markdown-cjk-friendly) plugins.

For example, if you want to treat [MDX](https://github.com/mdx-js/mdx) as markdown, put following config to `.textlintrc`:

```json
{
  "plugins": {
    "@textlint/markdown": {
      "extensions": [".mdx"]
    }
  }
}
```

For example, the following Markdown is parsed as emphasis and strikethrough when `cjkFriendly` is enabled:

```md
**このアスタリスクは強調記号として認識されず、そのまま表示されます。**この文のせいで。

**该星号不会被识别，而是直接显示。**这是因为它没有被识别为强调符号。

**이 별표는 강조 표시로 인식되지 않고 그대로 표시됩니다(이 괄호 때문에)**이 문장 때문에.
```

```json
{
  "plugins": {
    "@textlint/markdown": {
      "cjkFriendly": true
    }
  }
}
```

## Tests

```sh
npm test
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
