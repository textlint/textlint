# Getting Started with textlint

**textlint** does follow the following steps:

1. textlint load rules, every single rule is a plugin and you can add more at runtime.
2. textlint parse *texts* using Markdown/Text/HTML parser plugin.
3. textlint uses an AST([Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree "Abstract syntax tree") to evaluate patterns in *texts*.
4. textlint report errors/warning if exist.


## Installation
   
You can install `textlint` using npm:
   
    npm install -g textlint
   
## Installation of rules

You can find a rule in [A Collection of textlint rule](https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule "A Collection of textlint rule")

As an example, let's install [textlint-rule-no-todo](https://github.com/azu/textlint-rule-no-todo "textlint-rule-no-todo").

    $ npm install -g textlint-rule-no-todo

## Usage

``` markdown
# file.md

- [ ] write some some

`- [ ]` is a code and not error.

```

You can run textlint on any Markdown files:

    textlint --rule no-todo file.md

We recommended that use textlint with `.textlintrc` configuration file.

## Configuration

Create a `.textlintrc` file in your directory. In it, you'll see some rules configured like this:

```json
{
    "rules": {
        "no-todo": true
    }
}
```

You can run textlint without any command line options:

     $ textlint file.md
     # Automatically, load `.textlintrc` in your directory

## Next Steps
   
- Learn about advanced [configuring](./configuring.md) of textlint.
- Explore [textlint's rules](https://github.com/azu/textlint/wiki/Collection-of-textlint-rule)
- Can't find just the right rule? Make your own [custom rule](./rule.md).
- Can't handling `.ext` file? Make your own [custom plugin](./plugin.md).