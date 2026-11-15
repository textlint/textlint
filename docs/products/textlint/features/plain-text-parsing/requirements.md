# Plain text parsing

[日本語](requirements.ja.md)

## About this document

Plain text parsing converts plain text into TxtAST so that rules written for any format can check it.
Plain text has no markup, so the only structure that the parser recognizes is the line.
It is provided by `@textlint/text-to-ast` and used by the built-in `@textlint/textlint-plugin-text`.
The parent Product is [textlint](../../product.md).

The parser is also the smallest example of a TxtAST parser.
It uses only four generic nodes, and a plugin author can read it to learn what a parser must produce.
Its behavior is kept simple, so that this document and the parser can be read side by side.

This document defines which part of the text becomes which node, and the positions of each node.
What every TxtAST satisfies, such as the common properties and the position conventions, is defined in [TxtAST](../txtast/requirements.md).

### Scope

- The `parse(text)` function
- The node that each line and line ending becomes, with its range
- Line endings, an empty text, and a BOM
- The file extensions that the built-in plugin handles

### Out of scope

- Markdown and other formats with markup. See [Markdown parsing](../markdown-parsing/requirements.md)
- Recognizing paragraphs of several lines, headings, lists, or indentation in plain text
- Splitting prose into sentences or words. Rules do this, for example with a sentence splitter or a morphological analyzer
- Decoding bytes into a string. The parser receives a string
- The properties and conventions shared by all formats. See [TxtAST](../txtast/requirements.md)

## User stories

### Check each line of a plain text file

As a writer, I want each line of my text file to reach rules as prose so that the rules that I use for Markdown also check my text files.

**Acceptance criteria:**

Scenario: When a text has two lines, each line is a paragraph

- Given: A text whose lines are `first line` and `second line`
- When: The text is parsed
- Then: `Document` has a `Paragraph` for each line, a `Break` between them, and each `Paragraph` has one `Str` whose `value` is the whole line

Scenario: When a line looks like Markdown, it stays as text

- Given: A line `# Title with *emphasis*`
- When: The text is parsed
- Then: The line is one `Paragraph` with one `Str`, and `value` keeps `#` and `*`

Scenario: When a line is empty, it has no paragraph

- Given: A text `a`, an empty line, and `b`
- When: The text is parsed
- Then: The children of `Document` are `Paragraph`, `Break`, `Break`, and `Paragraph`, and no `Paragraph` has an empty `Str`

### Report the right position

As a rule author, I want every node to point to the exact source text so that errors and fixes land on the right characters, whatever line endings the file uses.

**Acceptance criteria:**

Scenario: When any text is parsed, the AST follows the position conventions of TxtAST

- Given: Any text, including text with every line ending, tabs, and surrogate pairs
- When: The text is parsed
- Then: `@textlint/ast-tester` accepts the AST

Scenario: When the text uses a lone `\r`, U+2028, or U+2029, the character ends a line

- Given: A text `a`, a lone `\r`, and `b`
- When: The text is parsed
- Then: The children of `Document` are `Paragraph`, `Break`, and `Paragraph`, and the second `Paragraph` starts at line 2, column 0, which is the line that textlint shows in a message for it

Scenario: When the text uses `\r\n`, the line ending is one `Break`

- Given: A text `a\r\nb`
- When: The text is parsed
- Then: The `Break` has `raw` `\r\n`, its `range` covers two characters, and the second `Paragraph` starts at line 2, column 0

Scenario: When the text ends with line endings, each line ending is a `Break`

- Given: A text `a`, followed by two `\n`
- When: The text is parsed
- Then: The children of `Document` are `Paragraph`, `Break`, and `Break`, and `loc.end` of `Document` is line 3, column 0

Scenario: When the text starts with a BOM, positions ignore it

- Given: A text that starts with U+FEFF
- When: The text is parsed
- Then: The AST is the same as for the text without the BOM, so positions agree with the text that textlint gives to rules

### Learn how to write a parser

As a plugin author, I want a small parser whose output is easy to predict so that I can see what a TxtAST parser must produce before I write one for my format.

**Acceptance criteria:**

Scenario: When the AST is read, it uses only generic nodes

- Given: Any text
- When: The text is parsed
- Then: The AST contains only `Document`, `Paragraph`, `Str`, and `Break`, and every node has only the common properties, `children` for `Document` and `Paragraph`, and `value` for `Str`

Scenario: When this document is read, the AST of a text can be written by hand

- Given: A text and the [node table](#nodes)
- When: A reader writes the expected AST by following the table
- Then: The AST that `parse` returns is the same

### Keep existing rules working

As a rule author, I want the AST of plain text to stay stable so that my published rules keep working after textlint updates.

**Acceptance criteria:**

Scenario: When textlint is updated in a minor or patch version, the AST of a text does not change

- Given: A text and the AST that one textlint version produces for it
- When: The text is parsed by a later minor or patch version
- Then: The AST has the same node types, properties, and positions. A change to them appears only in a major version and is listed in its release notes

### Check text files from untrusted contributors

As a writer who runs textlint in CI, I want any text file to be parsed in a time proportional to its size so that a pull request cannot stall the check.

**Acceptance criteria:**

Scenario: When a text is made longer, parsing time grows in proportion to the size

- Given: A text of many lines, or one line without line endings
- When: The text is made four times longer and parsed
- Then: Parsing takes about four times longer, not sixteen times

## KPIs

### Conformance to the TxtAST conventions

- **Target value:** `@textlint/ast-tester` accepts the AST of every test fixture and of every file of a corpus of real-world text.
- **Measurement method:** Parse the fixtures, every combination of a few lines and line endings, and the corpus, and run the tester on each AST.
- **Measurement period:** When the parser changes.

### Parsing speed

- **Target value:** No slower than the previous release on the same corpus. Faster is preferred.
- **Measurement method:** Parse a corpus of real-world documents in a loop and compare medians between the previous release and the change.
- **Measurement period:** When the parser implementation changes.

### Dependencies

- **Target value:** The only runtime dependency is `@textlint/ast-node-types`.
- **Measurement method:** Read the `dependencies` of the package.
- **Measurement period:** When dependencies of the package change.

## Functional requirements

### Parse plain text into TxtAST

**Overview:** `parse(text)` returns a `Document` node that contains the whole text.

**Input:** A string. It may be empty and may start with a BOM.

**Output:** A `Document` node that follows [TxtAST](../txtast/requirements.md).

#### Applicable conditions

##### Lines

A line ends with a line ending that the [TxtAST](../txtast/requirements.md) position conventions define: LF (`\n`), CR (`\r`), CRLF (`\r\n`), U+2028, or U+2029. CRLF is one line ending.
Plain text has no syntax of its own, so the lines of the text are the lines of `loc`.

A paragraph is one line.
Plain text has no rule that tells which lines form a paragraph, and a line is the only structure that every plain text has.
So the parser does not join lines, even when they are not separated by an empty line.

##### Nodes

| Part of the text | Node | Properties | Range |
| --- | --- | --- | --- |
| The whole text | `Document` | | From 0 to the end of the text |
| A line that is not empty | `Paragraph` | | From the first character of the line to the end of the line, without the line ending |
| The content of a `Paragraph` | `Str` | `value`: the line as written | The same as its `Paragraph` |
| A line ending | `Break` | | The line ending |

- The children of `Document` are `Paragraph` and `Break` nodes in source order.
- A `Paragraph` has exactly one child, a `Str`.
- `Break` is a child of `Document`, not of `Paragraph`, because a paragraph is one line and never contains a line ending.
- Every line ending becomes a `Break`, including the line ending of an empty line and the line endings at the end of the text.
- An empty line has no node of its own. Only its line ending is a `Break`.
- A line of only spaces or tabs is not empty. It is a `Paragraph`, and its `Str` keeps the spaces and tabs.
- `value` of `Str` equals its `raw`. Nothing is decoded or removed.

##### File extensions

The built-in plugin handles files with the extensions `.txt` and `.text`, and the extensions that its `extensions` option adds.

#### Exceptional behavior

##### Empty text

When the text is empty, `Document` has no children, its `range` is `[0, 0]`, and both `loc.start` and `loc.end` are line 1, column 0.

##### Text that ends with a line ending

When the text ends with a line ending, `loc.end` of `Document` is column 0 of the line after the last line ending.

##### BOM

A BOM at the start of the text is removed before parsing.
Offsets do not count it, and `raw` of `Document` does not include it.
textlint also removes the BOM from the text that it gives to rules, so positions agree.

##### Invalid text

Plain text has no syntax errors. `parse` does not throw for any string, including a string with lone surrogates or U+0000.

## Data requirements

### Required data

- **Source text:** The string given to `parse`. It is not stored after `parse` returns.

### Relationships

Each node except `Document` has exactly one parent, and the children of a node are in source order.

### Personal information

None. The parser does not collect or keep any data.

## External service dependencies

None. Parsing runs locally and does not use any network service.

## Security considerations

textlint runs on files from untrusted contributors in CI, so a crafted or unusual text must not stall parsing.
Parsing time must stay proportional to the size of the text.
The AST is at most three levels deep (`Document`, `Paragraph`, and `Str`), whatever the text is, so textlint and rules can traverse it recursively.
Each `parse` call is independent: the result does not depend on the texts parsed before.

## Open questions

None.
