# TxtNode interface

Parse text to AST(TxtNodes)

## TxtNodes

- `type`: type of Node
- `raw`: text value of Node
- `loc`: location object

`loc` :

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