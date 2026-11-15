# Plain text parsing design

[日本語](design.ja.md)

## About this document

This design explains how `@textlint/text-to-ast` meets the [Plain text parsing Requirements](requirements.md) of the [textlint Product](../../product.md).
The nodes it produces follow the [TxtAST Requirements](../txtast/requirements.md).

The parser is meant to be read as an example of a TxtAST parser, so the design favors code that maps one to one to the node table of the Requirements over small gains in speed.

### Audience

People and agents who change `@textlint/text-to-ast` or `@textlint/textlint-plugin-text`, and plugin authors who read the parser as an example.

### Prerequisites

- The [TxtAST Requirements](../txtast/requirements.md), especially the position conventions

### Outside this document

How the kernel traverses TxtAST and converts offsets into lines for messages, and the Markdown parser.

## Implementation approach

`parse` walks the text once, from line to line, and creates each node when it reaches it.
There is no intermediate list of lines and no second pass over the nodes.

### Preparation

`parse` removes a BOM at the start of the text.
From then on, every offset refers to the text without the BOM, and `raw` of `Document` is that text.

### Line loop

The loop keeps two values: the offset where the current line starts and the current line number, which starts at 1.
In each step, it does the following.

1. **Find the line ending.** The parser searches for the next line ending with one regular expression, `/\r\n|[\n\r\u2028\u2029]/g`, which lists the line endings of the Requirements. `\r\n` is the first alternative, so it is found as one line ending and not as `\r` followed by `\n`. The line ends where the line ending starts.
2. **Add a paragraph.** When the line is not empty, the parser adds a `Paragraph` with one `Str` for it.
3. **Add a break.** The parser adds a `Break` for the line ending, and the next line starts after it.

When no line ending is left, the rest of the text is the last line, which has no line ending, and the parser adds a `Paragraph` for it unless it is empty.
Because every line ending found in step 1 becomes a `Break` in step 3, the line endings of empty lines and those at the end of the text are handled the same way as any other.
The regular expression is created in each call, so its search position is not shared between calls.

### Positions

A node never spans lines, so its `loc` comes directly from the loop.
A `Paragraph` and its `Str` start at column 0 of the current line, and end at the column that is the length of the line.
A `Break` starts at that column and ends at column 0 of the next line, as the TxtAST position conventions ask for a span that ends right after a line ending.

The end of `Document` is the current line and the column of the end of the text in it, which the loop knows when it ends.
When the text ends with a line ending, that is column 0 of the line after it.

### Nodes

Each node is a plain object literal with its properties in a fixed order: `type`, `raw`, `value` for `Str`, `range`, `loc`, and `children` for parent nodes.
`raw` is sliced from the text, and `value` of `Str` is the same string as its `raw`.
Each kind of node has its own small function, so each row of the node table of the Requirements is one function.

## Architecture and sequence diagrams

No diagram is needed. `parse` is one function with one loop, and the plugin calls it from `preProcess`.

## Data model and ER diagrams

The output is the tree defined by the [TxtAST Requirements](../txtast/requirements.md), with the nodes listed in the [Plain text parsing Requirements](requirements.md#nodes).
The parser has no internal data beyond the two values of the loop.

## APIs and interfaces

### Parser

`parse(text: string): TxtDocumentNode` is the only function, and `Syntax` lists the node types that it produces: `Document`, `Paragraph`, `Str`, and `Break`, with the values of `ASTNodeTypes`.
`parse` has no options and does not throw for any string.

### Plugin

`@textlint/textlint-plugin-text` exports a `Processor`.
Its `availableExtensions()` returns `.txt`, `.text`, and the extensions of the `extensions` option.
`preProcess(text)` returns `parse(text)`, and `postProcess(messages, filePath)` returns the messages unchanged, with `<text>` as the file path when none is given.

## External service integration

None. The package depends only on `@textlint/ast-node-types` for the node types and uses only ECMAScript built-ins, so it runs in browsers as it is.

## Data handling

None. The text is not kept after `parse` returns.

## Authentication and authorization notes

None. Parsing has no access control.

## Security considerations

The [security considerations of the Requirements](requirements.md#security-considerations) ask for time proportional to the size and a bounded depth.

Each step of the loop searches for a line ending from the end of the previous one, so every character is visited once. The regular expression matches at most two characters, so it does not backtrack.
The depth of the AST is fixed by the node table, and the parser does not recurse.
The parser has no state outside a call, so calls are independent.

## Deployment notes

A change to node types, node properties, or positions breaks rules that depend on them, so such a change is released only in a major version, with the changes listed in the release notes.

## Alternatives considered

### Split the text into lines first

Splitting the text into an array of lines with a regular expression, and then mapping each line to nodes, separates finding lines from creating nodes.
It was not chosen because the array is an extra data structure that the reader has to follow, and the last line, which has no line ending, needs its own case in both steps.
The single loop is as short, and it handles every line ending in the same place.

### Reuse the line handling of the Markdown parser

The Markdown parser already has a line table and an emit phase that create `loc` from offsets.
It was not chosen because the plain text parser would then depend on the Markdown parser's internal data, and it would stop being a small example that can be read alone.

### Check each character for a line ending

A loop that reads each character code and checks it against the five line endings avoids the regular expression.
It was not chosen because it needs a function that returns the length of the line ending at a position and a second index to move, while the regular expression states the definition of line endings in one line and lets the engine scan the text.

## Open questions

None.
