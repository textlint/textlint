# gulp-textlint [![Build Status](https://travis-ci.org/textlint/gulp-textlint.svg?branch=master)](https://travis-ci.org/textlint/gulp-textlint)

gulp plugin for [textlint](https://github.com/azu/textlint).

* Require [.textlintrc](https://github.com/azu/textlint#textlintrc)
* Require [rules](https://github.com/azu/textlint#rule-list---collection-of-textlint-rule)
  * As you can use [vvakame/prh](https://github.com/vvakame/prh)'s format dictionary.

## Usage

```js
var gulp = require('gulp');
var textlint = require('gulp-textlint');

gulp.task('textlint', function() {
  return gulp.src('./path/to/src/**/*.md')
    .pipe(textlint());
});
```

As you can path to config for textlint. Like below.

```js
...
gulp.task('textlint', function() {
  return gulp.src('./path/to/src/**/*.md')
    .pipe(textlint({
      formatterName: "pretty-error"
    });
});
```

When you would like to change target dynamically you should use [yargs](https://github.com/bcoe/yargs).

e.g.

```js
var argv = require('yargs').argv;

gulp.task('textlint', function() {
  var src = argv.t;
  return gulp.src(src)
    .pipe(textlint());
});

gulp.task('watch', function() {
  var src = argv.t;
  if (src) {
    gulp.watch(src, ['textlint']);
  }
});
```

Then execute `watch` task with `-t` option.

```sh
gulp watch -t "./path/to/*.md"
```

## Example

Please See [example/](./example/).