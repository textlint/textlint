# Node module example

TypeScript version of [use-as-module](https://github.com/textlint/textlint/tree/master/examples/use-as-module).


## Usage

```sh
$ npm install
$ npm test # success
```

Failure scenario:

```sh
$ node lib/examples/use-as-ts-module/src/index.js fixtures/failure.md
no-todo: Found TODO: '- [ ] This line should fail and report an error'
/.../textlint/examples/use-as-ts-module/fixtures/failure.md:5:3
         v
    4.
    5. - [ ] This line should fail and report an error
    6. - TODO: This line should fail as well
         ^

no-todo: Found TODO: 'TODO: This line should fail as well'
/.../textlint/examples/use-as-ts-module/fixtures/failure.md:6:3
         v
    5. - [ ] This line should fail and report an error
    6. - TODO: This line should fail as well
    7. - This line should fail!
         ^

no-exclamation-question-mark: Disallow to use "!".
/.../textlint/examples/use-as-ts-module/fixtures/failure.md:7:24
                              v
    6. - TODO: This line should fail as well
    7. - This line should fail!
    8. - `TODO`: This line should not
                              ^

✖ 3 problems (3 errors, 0 warnings)
```
