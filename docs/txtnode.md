# TxtNode interface

Parse text to AST(TxtNodes)

## TxtNodes

- `type`: type of Node
- `raw`: text value of Node
- `loc`: location object

### `type`

`type` is TxtNode type.

- plain text type
- Markdown text type

### `loc`

`loc` is location info object.

```json
"loc": {
    "start": {
        "line": 2,
        "column": 4
    },
    "end": {
        "line": 2,
        "column": 10
    }
}
```

## Warning

Other properties is not assured.