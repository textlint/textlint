# Node

## Interface

The interface of node is defined as [TxtNode](../typing/txtnode.d.ts).

## Exceptional Node

The `raw` value of `CodeBlock` node doesn't to contain backticks.

`CodeBlock` type is a general term for `FencedCode` and `IndentedCode`.

Following case, the `raw` value is `var code = "code";\n`.

    ```
    var code = "code";
    ```
    
`CodeBlock` node has not a child node like `Str`.
We provide `raw` property as value of `CodeBlock` for linting code.