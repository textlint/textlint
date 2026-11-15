# Markdown parsing design

[日本語](design.ja.md)

## About this document

This design explains how `@textlint/markdown-to-ast` meets the [Markdown parsing Requirements](requirements.md) of the [textlint Product](../../product.md).
The nodes it produces follow the [TxtAST Requirements](../txtast/requirements.md).

### Audience

People and agents who change `@textlint/markdown-to-ast` or `@textlint/textlint-plugin-markdown`.

### Prerequisites

- [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/), especially its [parsing strategy](https://spec.commonmark.org/0.31.2/#appendix-a-parsing-strategy), and [GFM](https://github.github.com/gfm/)
- The [TxtAST Requirements](../txtast/requirements.md)

### Outside this document

How rules traverse TxtAST, and the plain text parser.

## Implementation approach

The package contains its own CommonMark + GFM parser that produces TxtAST directly.
textlint only needs the parsing part of a Markdown processor, so the package does not depend on a general-purpose framework, and it does not build an intermediate AST that is converted afterward.

The design follows three ideas.

- **One source string, offsets everywhere.** The parser never copies or rewrites the text while it parses. Every intermediate value is an offset into the source, so `range` is exact by construction, and `raw` is one slice at the end.
- **Data in flat arrays.** Nodes, lines, and stacks are typed arrays indexed by number. No object is created per node until the result is built.
- **Each character is visited a bounded number of times.** No step rescans the same text for each candidate, so time stays proportional to the size.

Parsing runs in three phases: blocks, inlines, and emit.

### Preparation

`parse` removes a BOM, and then the parser prepares two things.

The first is the text to recognize.
When the text has U+0000, the parser works on a copy with U+FFFD in its place.
The replacement keeps the length, so offsets are the same in both, and `raw` is still sliced from the original text.

The second is the line table: the start offset of every line, built in one scan for `\n`, `\r\n`, and `\r`.
The block phase iterates over it, and the emit phase uses it to turn offsets into `loc`.

### Node pool

The three phases share one node pool.
The pool is a "struct of arrays": each field of a node is a typed array, and a node is an index.

| Field | Content |
| --- | --- |
| kind | The node type as a small integer |
| start, end | Offsets in the source |
| parent, first child, last child, previous sibling, next sibling | Indexes of other nodes |
| four payload slots | Meaning depends on the kind: a heading depth, a list start number, a checked state, or an index into the side table |

The side table is an ordinary array for values that are not numbers: decoded strings such as a `url` or a `value` with escapes, and the `align` array of a table.
A `Str` whose `value` equals its `raw` has no entry, and its `value` is the same slice as `raw`.

The tree is a linked structure, so the inline phase can wrap existing nodes in a new parent, such as `Emphasis`, by relinking indexes without moving data.

### Block phase

The block phase follows the first phase of the CommonMark parsing strategy.
It reads the text line by line and keeps a stack of open containers below `Document`.

For each line, it does the following.

1. **Continue open containers.** From the outermost, each open container checks whether the line continues it: a block quote needs `>`, and a list item or a footnote definition needs its indentation. Tabs are counted as columns without rewriting the text.
2. **Continue or close the open leaf.** If every container matched, the open leaf decides whether the line belongs to it: a fenced code block until its closing fence, an HTML block until its end condition, and so on. If containers did not match and the open leaf is a paragraph, the line may be a lazy continuation line.
3. **Open new blocks.** Otherwise the parser looks at the first character after the indentation and tries the block starts that can begin with it: block quote marker, ATX heading, code fence, HTML block, setext underline, thematic break, list item, table delimiter row, and footnote definition. A line indented by four or more columns starts indented code instead. A container start repeats this step for the rest of the line.
4. **Add the line to a leaf.** The rest of the line becomes a new paragraph, or continues the open paragraph.

Whether a block start can interrupt a paragraph is decided in step 3 with one flag that tells whether the line would otherwise be paragraph continuation text.
This flag implements the rules that an empty list item, an ordered list that does not start with 1, and HTML block start condition 7 do not interrupt a paragraph, including on lazy continuation lines.

A leaf does not copy its lines.
It records them as segments, pairs of start and end offsets after the container markers and indentation are removed.
The segments are what the inline phase reads.

When a paragraph closes, the parser takes link reference definitions from its start, and each becomes a `Definition` node.
Definitions are registered by normalized label, and the first definition of a label wins.

A table starts when a delimiter row follows the last line of an open paragraph and the cell counts match.
The last line becomes the header row, and the lines before it stay a paragraph.
Cells are split at unescaped `|`, and each cell records the segment of its content.

A task list marker is recognized when the inline phase starts on the first paragraph of a list item.
The checked state goes to the `ListItem`, and the paragraph's start moves past the marker and the whitespace after it.

Front matter is tried once, at the first line, before the line loop.
If the closing fence is not found, the line loop starts from the first line as if nothing was tried.

When the open containers reach the nesting limit, step 3 does not open another container, and the marker is handled as text of the current block.

### Inline phase

The inline phase follows the second phase of the CommonMark parsing strategy.
It visits every leaf with inline content: paragraphs, headings, table cells, and the content of inline notes.

**Buffer.** A leaf of one line is parsed in place in the source.
A leaf of several lines is parsed through a buffer that joins its segments with `\n`, so container markers and indentation between the lines are not seen as content.
The buffer keeps the start of each line, and positions in the buffer are mapped back to source offsets when the nodes are finished.
This is the only place where text is copied before the result is built.

**Scan.** The parser moves through the buffer and stops only at characters that can start a construct.
Text between them becomes `Str` nodes.

| Character | Construct |
| --- | --- |
| `` ` `` | Code span |
| `\` | Escape, or hard line break before a line ending |
| `&` | Character reference |
| `<` | Autolink or raw HTML |
| `[`, `![` | Opens a bracket for a link, image, or footnote reference |
| `]` | Closes the nearest bracket, or the nearest inline note |
| `^[` | Opens an inline note |
| `*`, `_`, `~` | Delimiter run |
| line ending | Hard line break when preceded by two or more spaces |
| Start of `www.`, `http://`, `https://`, or an e-mail address | Autolink literal |

**Brackets.** `[` and `![` are pushed to a bracket stack.
At `]`, the parser looks at the nearest bracket and tries, in order, an inline link, a full or collapsed reference, and a shortcut reference.
When a link is made, the delimiters inside it are resolved first, and earlier `[` brackets are deactivated, because links do not contain links.

**Delimiters.** Runs of `*`, `_`, and `~` are pushed to a delimiter stack with their length and whether they can open or close.
They are resolved in one pass in source order: each closer takes the nearest opener that it can match, the pair becomes `Emphasis`, `Strong`, or `Delete`, and the delimiters between the pair are removed.
Because one pass handles all three characters, pairs never cross.

**Finish.** After the scan, adjacent text is merged into one `Str`, buffer positions are mapped to source offsets, and values that need decoding are stored in the side table.

### Emit phase

The emit phase walks the pool once from `Document` and creates the `TxtNode` objects.
A node is a plain object with its properties in a fixed order per kind.
`raw` is sliced from the original text, and `loc` comes from the line table.
When the text has U+2028 or U+2029, the line table is rebuilt before the emit phase so that these characters also end a line. They end a line for `loc` and not for the block structure, and most documents do not have them, so the block phase keeps its own table.
Nodes are visited in source order, so the line lookup for a start offset continues from the line of the previous node instead of searching the table.

Nodes are created eagerly and completely.
A rule may read any property of any node, and a plain object keeps the AST serializable, as TxtAST requires.

### State between calls

The pool, the line table, and the stacks are module-level and are reused by the next `parse` call, so a call does not allocate them again.
Every call resets the counters at its start and sets all fields of a node when it allocates the node, so a call never reads data of a previous document.
The definitions and the side table are created per call.
When `parse` returns or throws, the references to the text are released.

## Architecture and sequence diagrams

No diagram is needed. `parse` calls the three phases in order, and none of them calls out to other modules except the entity table.

## Data model and ER diagrams

The output is the tree defined by the [TxtAST Requirements](../txtast/requirements.md), with the nodes listed in the [Markdown parsing Requirements](requirements.md#functional-requirements).

The internal data is the node pool, the side table, the line table, and the segments, as described under [Implementation approach](#implementation-approach).
None of them is exposed.

## APIs and interfaces

`parse(text: string): TxtDocumentNode` is the only function, and `Syntax` re-exports `ASTNodeTypes`.
`parse` has no options and does not throw for any text.

Nodes have only the common properties of TxtAST and the properties of their node type.

## External service integration

None. The package has no third-party runtime dependencies.
The parser uses only ECMAScript built-ins (typed arrays, strings, and regular expressions with Unicode property escapes) and no Node.js modules, so it runs in browsers as it is, as the [Requirements](requirements.md#parse-without-a-server) ask.
The named character reference table is generated from the [WHATWG entities.json](https://html.spec.whatwg.org/entities.json) by a script in the package and committed as source, so no data is fetched at run time.

## Data handling

None. The source text is not kept after `parse` returns, although the reused pool keeps its allocated capacity.

## Authentication and authorization notes

None. Parsing has no access control.

## Security considerations

The [security considerations of the Requirements](requirements.md#security-considerations) ask that a crafted document neither stalls parsing nor overflows the call stack.

### Time proportional to the size

The block phase visits each line once per open container, and the number of containers is bounded by the nesting limit.

The inline phase uses the CommonMark delimiter and bracket stacks, which handle unclosed brackets and delimiters without rescanning.
For each kind of closer, the delimiter search remembers how far back it has already searched without finding an opener, so later closers do not search the same range again.

Some constructs need a closing part that may be far away or missing.
If each candidate searched for its own closing part, many candidates would scan the same text again and again.
For these, the parser remembers the result of the scan for the current buffer.

| Candidate | What is remembered |
| --- | --- |
| Backtick run | The last position of a run of each length, found in one scan of the buffer |
| `<!--`, `<?`, `<!X`, `<![CDATA[` | That no terminator of this kind exists after a position |
| Link title in parentheses | The range that the last scan covered and where it ended |
| Trailing punctuation of an autolink literal | The run that the last scan covered and its result |

### Bounded depth

Nesting depth is decided by the document, so the parser bounds it with a fixed limit of 100 levels, applied separately to blocks and to inlines.

For blocks, the stack of open containers below `Document` never grows beyond the limit.

For inlines, the limit applies to the height of the inline subtree, not to the number of delimiters.
Each node records the height of its subtree when it is created.
A delimiter or bracket pair that would make a node higher than the limit is not matched, so the inner levels are kept and the outer markers stay text.
Once the limit is reached at a position, the search does not go back before that position, because any earlier opener would wrap the same deep content.

Because blocks and inlines are limited separately, the deepest AST is `Document`, 100 container levels, a `Paragraph` or `TableCell`, 100 inline levels, and `Str`.

### No recursion on depth

No phase recurses on the nesting depth.
The walks whose depth follows the tree, which are finishing inlines, collecting the text of an image description, and the emit phase, use parent links or an explicit stack.
The limit alone would keep recursion safe, but loops keep the parser safe when the limit changes.

### Independent calls

If `parse` throws, the next `parse` call resets the shared state, so a failure does not affect later documents.

## Deployment notes

A change to node types, node properties, or positions breaks rules that depend on them, so such a change is released only in a major version, with the changes listed in the release notes.

## Alternatives considered

### Use remark

remark has a large ecosystem, and its plugins could add syntax.
It is a general-purpose Markdown processor that also covers transformation and serialization, while textlint uses only parsing and converts the result into its own AST.
It was not chosen for three reasons.
It brings packages that textlint never uses.
Its AST leaves some nodes without positions, so the conversion to TxtAST needs workarounds.
Its behavior at the edges is decided by its implementation, so textlint cannot make the AST follow its own Requirements.

### Use micromark and mdast-util-from-markdown directly

This drops the framework layer and keeps the tokenizer ([#2187](https://github.com/textlint/textlint/pull/2187)).
It was not chosen because the tokenizer and the conversion from its AST stay, with the same limits on positions and behavior.

### Maintain an in-house parser (chosen)

The cost is that textlint maintains its own parser and follows future CommonMark and GFM changes by itself.
This is accepted because CommonMark and GFM are written specifications with example suites, which make the behavior testable, and textlint has no syntax of its own to add beyond the extensions listed in the Requirements.

### Create `loc` and `raw` on first access

Rules read `raw` and `loc` of few nodes, so creating them only when read would save work in the emit phase.
It was not chosen because it needs getters on a prototype, which makes nodes differ from plain data: they would not serialize as they are, and the kernel and tools that copy nodes would see different objects.
The saving is small compared with the time of a whole lint run.

### Resolve strikethrough separately from emphasis

Resolving `~` in its own pass is simple, because strikethrough has no rule of three.
It was not chosen because two passes let pairs cross, and the result then depends on which pass runs first instead of on the source order.

### Recurse over the tree

Recursive walks are shorter to write, and the nesting limit bounds their depth.
They were not chosen because the safety of the parser would then depend on the value of the limit.

## Open questions

- **CJK-friendly emphasis:** textlint/textlint#2113 proposes an opt-in option that recognizes emphasis next to CJK punctuation. With this design it is implemented in the inline phase, where a delimiter run decides whether it can open or close, following the [markdown-cjk-friendly specification](https://github.com/tats-u/markdown-cjk-friendly), and `parse` takes an options argument. Until the Requirements decide it, `parse` has no options. Revisit when the Requirements include it. azu decides with the PR author.
