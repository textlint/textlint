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

Enable `cjkFriendly` when the target Markdown renderer supports CJK-friendly parsing rules for emphasis and GFM strikethrough, such as GitLab Flavored Markdown, Rspress, or VitePress. Otherwise, keep the default `false` to match CommonMark and GFM parsing.

When `cjkFriendly` is enabled, textlint recognizes emphasis and GFM strikethrough next to CJK text without spaces:

```md
**重要です。**次の文です。
~~削除します。~~次の文です。

**很重要。**下一句。
~~删除。~~下一句。

**중요합니다.**다음 문장입니다.
~~삭제합니다.~~다음 문장입니다.
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
