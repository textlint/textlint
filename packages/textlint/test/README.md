# test architecture

## TODO

- This tests contains `textlint` and `textlint-kernel` test
- We should separate theses as possible.

## Purpose

### Each Test is separated by directory

If you test `config-initializer.js`, do following step:

1. Create `config-initializer` directory.
2. Create `config-initializer-test.js` file and put it into `config-initializer` directory.
3. Run test :)

```
config-initializer
└── config-initializer-test.js
```

### Each Test has fixtures directory

Each test has `fixtures` directory.
It make `fixtures` independent.

```
test/
├── README.md
├── cli
│   ├── cli-test.js
│   └── fixtures/
└── util
    ├── dummy-source-code.ts
    └── fixtures
```

### Duplicated fixtures is OK.

Each test has `fixtures` directory, as a result, create duplicated fixtures.

- [ ] Create fixtures function.
