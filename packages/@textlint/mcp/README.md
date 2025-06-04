# @textlint/mcp

This package is part of the [textlint/textlint](https://github.com/textlint/textlint).
`@textlint` ecosystem and provides [Model Context Protocol](https://modelcontextprotocol.io) support for `textlint`.

It enables integration with MCP servers to extend the functionality of `textlint` by providing additional tools and resources.

## Installation

```bash
npm install --save-dev textlint
```

## Usage

```bash
npx textlint --mcp
```

## Example config

A typical configuration looks like this:

```json
{
  "servers": {
    "textlint": {
      "command": "npx",
      "args": [
        "textlint",
        "--mcp"
      ]
    }
  }
}
```

## Tools

- `lintFile`
- `lintText`
- `fixFile`
- `fixText`

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](../../../docs/CONTRIBUTING.md) guide for more information.

## License

This project is licensed under the [MIT License](../../../LICENSE).
