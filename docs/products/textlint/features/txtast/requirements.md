# TxtAST

[日本語](requirements.ja.md)

## About this document

TxtAST is the tree of nodes that a plugin produces from a document and that textlint passes to rules.
It describes the structure of the markup, and the prose stays in text nodes, so one rule works on every document format.
This document defines what every TxtAST must satisfy: the common properties, the position conventions, and how a format adds its own nodes. The generic node types and their properties are defined by the type definitions of `@textlint/ast-node-types`.
The parent Product is [textlint](../../product.md).

TxtAST is defined loosely on purpose.
A format may add node types and properties, and this document fixes only the parts that rules rely on across formats.

### Scope

- The properties that every node has
- The conventions between `raw`, `range`, and `loc`
- What defines the generic node types and their properties
- Extension nodes that a format adds, and how their names differ from generic nodes
- The relation to the public document for rule and plugin authors

### Out of scope

- Which syntax of a format becomes which node. Each parser defines it, for example [Markdown parsing](../markdown-parsing/requirements.md)
- The grammar of natural language. Sentences and words are not nodes, and rules split the prose
- How textlint traverses the tree and calls rules
- The list of generic nodes and their properties. The type definitions of `@textlint/ast-node-types` define it

## User stories

### Write one rule for every format

As a rule author, I want every format to give the same node types and properties for the same structure so that my rule works on Markdown, plain text, and other formats without knowing the parser.

**Acceptance criteria:**

Scenario: When a rule handles a generic node type, the required properties are present in every format

- Given: A rule that handles `Header` and reads `depth`
- When: The rule runs on documents of two formats whose parsers follow this document
- Then: Every `Header` node has `depth` from 1 to 6 in both formats, and the rule needs no check for the format

Scenario: When a rule reads a property that is not required, the property may be absent

- Given: A rule that reads `lang` of `CodeBlock`
- When: The rule runs on a format that has no language annotation for code blocks
- Then: `lang` is absent, `undefined`, or `null`, and the rule handles the node without the property

### Report and fix at the exact position

As a rule author, I want `raw`, `range`, and `loc` of a node to describe the same span so that an error or a fix calculated from any of them lands on the same characters.

**Acceptance criteria:**

Scenario: When a node is produced, `raw` is the source text of `range`

- Given: A document text and its AST
- When: A rule reads any node
- Then: `raw` equals the text from `range[0]` to `range[1]`

Scenario: When a node spans several lines, `loc` and `range` point to the same characters

- Given: A node that starts in the middle of line 2 and ends in the middle of line 4
- When: A rule converts `loc.start` and `loc.end` to offsets by counting lines and columns
- Then: The offsets equal `range[0]` and `range[1]`

Scenario: When a node ends with a line ending, `loc.end` is on the next line

- Given: A node whose `range` ends right after a line ending, such as a hard line break
- When: A rule reads `loc.end`
- Then: `loc.end` is line + 1 and column 0, not a column past the end of the line

### Know whether a node type is shared

As a rule author, I want to tell from the name whether a node type is shared by all formats so that I know when my rule depends on one format.

**Acceptance criteria:**

Scenario: When a node type is generic, its name is PascalCase

- Given: A node type that the type definitions list as a generic node
- When: A rule author reads the type name
- Then: The name starts with an uppercase letter, such as `Paragraph`

Scenario: When a node type belongs to one format, its name is lowercase

- Given: A node that only one format has, such as front matter in Markdown
- When: The parser of the format produces the node
- Then: The type name starts with a lowercase letter, such as `yaml`, and the Requirements of that parser list it

### Produce an AST for a new format

As a plugin author, I want to know the minimum that an AST must satisfy so that rules written for other formats work on mine.

**Acceptance criteria:**

Scenario: When a plugin maps a structure that a generic node covers, it uses the generic node

- Given: A format that has headings
- When: The plugin converts a heading
- Then: The node is `Header` with `depth`, not a new node type

Scenario: When a plugin has a structure that no generic node covers, it adds an extension node

- Given: A format that has a structure without a generic counterpart
- When: The plugin converts the structure
- Then: The node has a lowercase type name and the common properties, and rules for other formats ignore it without failing

## KPIs

### Conformance of the built-in parsers

- **Target value:** Every node that the built-in parsers produce satisfies the common properties and the position conventions.
- **Measurement method:** Check every node of the ASTs for the parser test fixtures and for a corpus of real-world documents.
- **Measurement period:** When a built-in parser changes.

## Functional requirements

### Common properties

**Overview:** Every node has the same set of properties, whatever its type and format.

**Input:** A node of any type.

**Output:** The properties below.

#### Applicable conditions

##### Properties of every node

| Property | Value |
| --- | --- |
| `type` | A non-empty string that names the node type |
| `raw` | The source text of the node |
| `range` | A pair of offsets `[start, end]` in the document text. `start` is inclusive and `end` is exclusive. Offsets count UTF-16 code units from 0 |
| `loc` | `start` and `end` positions. Each position has `line`, which starts at 1, and `column`, which starts at 0 and counts UTF-16 code units |

##### Kinds of nodes

- A **parent node** has `children`, an array of nodes in source order. The array may be empty.
- A **text node** has `value`, a string. `value` is the content without the markup, so it may differ from `raw`.
- Other nodes have neither.

##### Properties added at run time

`parent` is not part of the AST that a parser produces.
textlint adds `parent` to every node except the root before it calls rules.

##### Additional properties

A node may have properties that this document does not list.
A rule can rely across formats only on the properties that the type definitions mark as required.

##### Serializable

An AST consists of plain data that can be written as JSON and read back without loss.

### Position conventions

**Overview:** `raw`, `range`, and `loc` of a node describe one span of the document text, and the spans of the tree are nested consistently.

**Input:** A document text and its AST.

**Output:** An AST in which the conditions below hold for every node.

#### Applicable conditions

##### One span per node

- `range[0]` is less than or equal to `range[1]`.
- `raw` equals the document text from `range[0]` to `range[1]`.
- `loc.start` is the line and column of `range[0]`, and `loc.end` is the line and column of `range[1]`.

##### Lines

A line ends at a line ending of the format.
The character after a line ending is at column 0 of the next line.
`\n` and `\r\n` are line endings in every format, and `\r\n` is one line ending.
A format states any other line ending in the Requirements of its parser.

A node may contain line endings in `raw` and `value`. For example, a paragraph of several lines is one `Paragraph`.
A line ending is not always a node. The Requirements of each parser state which line endings become `Break`.

##### Tree

- The root is `Document`. Its `range` starts at 0 and covers the whole document text.
- The `range` of a child is inside the `range` of its parent.
- Children are in source order, and the ranges of siblings do not overlap.

##### Byte order mark

A parser states in its Requirements whether offsets count a byte order mark at the start of the text.

### Generic nodes

**Overview:** Generic nodes are the node types shared by all formats. Their names are PascalCase.

**Input:** A structure of a document that a generic node covers.

**Output:** A node of a generic type with its required properties.

#### Applicable conditions

##### Defined by the type definitions

The type definitions of `@textlint/ast-node-types` are the definition of the generic nodes.
They define which node types exist, which properties each node type has, and which values a property takes.
A property that the type definitions mark as optional may be absent, `undefined`, or `null`. Every other property is required.
The comments of the type definitions state the meaning of each node type and property, such as what `value` holds.
This document does not repeat the list, so that there is one definition.

The generic nodes are of these kinds.

- Blocks: `Document`, `Paragraph`, `Header`, `BlockQuote`, `List`, `ListItem`, `CodeBlock`, `HorizontalRule`, `Html`, `Comment`, `Table`, `TableRow`, `TableCell`, and `Definition`
- Inlines: `Str`, `Break`, `Emphasis`, `Strong`, `Delete`, `Code`, `Link`, `Image`, `LinkReference`, and `ImageReference`

##### Prose stays in `Str`

Markup becomes nodes, and the natural language text stays in `Str`.
A parser does not split `Str` into sentences or words.

##### Deprecated names

Names that the type definitions mark as deprecated, such as `HtmlBlock` and `ReferenceDef`, are not generic nodes.
A parser produces `Html` and `Definition` instead.

##### What the type definitions cannot express

The position conventions, the rule that prose stays in `Str`, and the naming of extension nodes are defined only in this document.

### Extension nodes

**Overview:** A format adds extension nodes for structures that no generic node covers.

**Input:** A structure that only one format, or a few formats, has.

**Output:** A node with a lowercase type name.

#### Applicable conditions

##### Naming

The type name of an extension node starts with a lowercase letter, such as `yaml` or `footnoteReference`.
The casing shows whether a rule can rely on the node type across formats.

##### Same common properties

An extension node has the common properties and follows the position conventions.
It is a parent node when it has `children`, and a text node when it has `value`.

##### Defined by the parser

The Requirements of the parser that produces an extension node list its type name, meaning, and properties.

##### Becoming a generic node

An extension node becomes a generic node when several formats share the structure and rules need it across formats.
The generic node gets a PascalCase name in the type definitions, and the change of the type name is released in a major version.

#### Exceptional behavior

##### A rule does not know an extension node

textlint calls a rule only for the node types that the rule handles.
A rule that does not handle an extension node is not called for it, and neither textlint nor the rule fails.

### Public document

**Overview:** The public document tells rule and plugin authors how to use TxtAST, and this document is the definition that the public document follows.

**Input:** A change to this document.

**Output:** A public document that agrees with this document.

#### Applicable conditions

The public document is [TxtAST interface](../../../../txtnode.md) on the website.
It explains the common properties, lists the node types, and shows examples.
When the two differ, this document is correct and the public document is updated.
The public document may refer to the type definitions instead of repeating the details.

## Data requirements

### Required data

- **Document text:** The text that a parser receives. `range` and `raw` of every node refer to it.
- **AST:** The tree that a parser returns for a document text.

### Relationships

Each node except the root has exactly one parent.
An AST belongs to one document text.

### Personal information

None. TxtAST is a data format and does not collect data. An AST contains the document text, so it is handled as the document is.

## External service dependencies

None. TxtAST is a data format.

## Security considerations

textlint and rules traverse an AST, and many of them traverse recursively.
The depth of an AST is decided by the document, so a crafted document must not make the tree so deep that a traversal overflows the call stack.
A parser limits the nesting depth of the AST that it produces, and states the limit in its Requirements.

## Open questions

- **Checking the position conventions in the tester:** `@textlint/ast-tester` checks the common properties, and it is open whether it also rejects an AST that violates the position conventions. Published plugins may violate them, and a check would fail the tests of rules that use such a plugin. Until this is decided, the conventions are requirements for parsers, and each built-in parser checks them in its own tests. Revisit after measuring the ASTs of the widely used plugins. azu decides.
- **Characters that count as line endings differ between parsers:** This is about which characters end a line when `loc` is calculated, not about whether a node may contain line endings. Formats count different characters as line endings, for example a lone `\r` in Markdown, and textlint converts offsets to lines for messages with its own definition. It is open whether TxtAST fixes one definition for all formats. Until this is decided, each parser states its line endings, and messages use `range`. Revisit when a report shows a wrong line or column in a message. azu decides.
- **What the public document does not describe:** The public document does not describe extension nodes or the position conventions. It is open whether the public document is rewritten in one change or section by section. Until then, this document is the definition. Revisit when this document is merged. azu decides.
