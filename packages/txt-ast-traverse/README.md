# txt-traverse

- [ ] Write a project description

## Installation

- [ ] Describe the installation process

## Usage

- [ ] Write usage instructions


## Node

Markdown:

```markdown
Hello *world*
```

AST:

```json
{
    "t": "Document",
    "start_line": 1,
    "start_column": 1,
    "end_line": 0,
    "children": [
        {
            "t": "Paragraph",
            "start_line": 1,
            "start_column": 1,
            "end_line": 0,
            "inline_content": [
                {
                    "t": "Text",
                    "c": "Hello"
                },
                {
                    "t": "Text",
                    "c": " "
                },
                {
                    "t": "Emph",
                    "c": [
                        {
                            "t": "Text",
                            "c": "world"
                        }
                    ]
                }
            ],
            "children": []
        }
    ]
}
```

### Classify Node

- So-called `Node` has `t` or `type`
- `inline_content` wrapped Nodes.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT