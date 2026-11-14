# Markdown parsing design

## About this document

This design explains how `@textlint/markdown-to-ast` meets the [Markdown parsing Requirements](requirements.md) of the [textlint Product](../../product.md).

### Audience

People and agents who change `@textlint/markdown-to-ast` or `@textlint/textlint-plugin-markdown`.

### Prerequisites

- CommonMark and GFM specifications
- The `TxtNode` interface in `@textlint/ast-node-types`

### Outside this document

How rules traverse TxtAST, and the plain text parser.

## Implementation approach

The package delegates parsing to the unified/remark ecosystem and converts its mdast output into TxtAST.

1. `remark-parse` (micromark) tokenizes and builds mdast, with `remark-gfm`, `remark-frontmatter`, and `remark-footnotes` (`inlineNotes: true`) as extensions.
   The JSON front matter fences (`;;;`, `---json`, and `{`) are configured as custom `remark-frontmatter` matters.
2. The GFM autolink literal transforms of `mdast-util-gfm` are disabled after `remark-gfm` is registered.
   The transforms create nodes without positions (remarkjs/remark-gfm#16), and the tokenizer-level autolink literals are enough.
3. The whole mdast is walked with `neotraverse`.
   Each node's `type` is renamed through a syntax map (for example `heading` to `Header`, `text` to `Str`), and `range`, `loc`, and `raw` are computed from mdast's `position`.
   Types that are not in the map keep their mdast names, which is why `footnote` and `footnoteDefinition` are lowercase.
   The original `position` stays on each node as a non-enumerable property for unist compatibility.
4. `Str` and `Link` nodes without a position are given an estimated position from their siblings.
   This fallback is not reached by any fixture, because step 2 removes the source of such nodes.

A BOM is removed before parsing, because micromark does not count it in offsets.

## Architecture and sequence diagrams

No diagram is needed. The flow is a single function call followed by one tree walk.

## Data model and ER diagrams

The output is the `TxtNode` tree defined in `@textlint/ast-node-types`. No other data is kept.

## APIs and interfaces

`parse(text: string): TxtDocumentNode` is the only function. `Syntax` re-exports `ASTNodeTypes`.

## External service integration

None. The implementation dependencies are `unified`, `remark-parse`, `remark-gfm`, `remark-frontmatter`, `remark-footnotes`, `neotraverse`, `structured-source`, and `debug`.

## Data handling

None. The source text is not kept after `parse` returns.

## Authentication and authorization notes

None. Parsing has no access control.

## Security considerations

Parsing time grows faster than the input on some inputs, which does not meet the [Requirements](requirements.md#security-considerations).
With Node.js 22, a table with 20,000 rows takes about 25 seconds, 20,000 unclosed brackets take about 24 seconds, and 1,000 nested lists take about 24 seconds.

## Deployment notes

None.

## Alternatives considered

There is no record of alternatives considered when remark was adopted.

## Open questions

- **Known defects:** When a document starts with a line that looks like a front matter fence but is not closed (for example a thematic break `---`), lists in the rest of the document are not recognized. A list item that ends with a task list checkbox and a line ending has a `loc` that does not match its `range`. Both come from the micromark/mdast layer.
