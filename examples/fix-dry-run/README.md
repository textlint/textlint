# --fix example

## Usage

    npm run textlint
    # textlint README.md

## How to report Error

```sh
npm run textlint
/Users/azu/.ghq/github.com/textlint/textlint/examples/fix/README.md
  19:1   error  jquery => jQuery          prh
  19:13  error  javascript => JavaScript  prh

✖ 2 problems (2 errors, 0 warnings)
```
    

## How to fix Error

```
npm run textlint-fix
# textlint --fix README.md
```
    
## Example

jquery is a javascript library.
Long long text.

textlint fix this error.
This is Cookie,But this is not cookie.
END.
