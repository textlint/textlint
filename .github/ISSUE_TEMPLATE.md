<!--
Before Bug Reporting, Please update textlint and try it.

for updating global

```
npm uninstall -g textlint
npm install -g textlint
```

OR

for updating local

```
npm uninstall textlint
npm install -D textlint@latest
```
-->


**What version of textlint are you using?**
<!-- 
$ textlint -v
-->
**What file type (Markdown, plain text, etc.) are you using?**


**What did you do? Please include the actual source code causing the issue.**

**What did you expect to happen?**

**What actually happened? Please include the actual, raw output from textlint.**
<!--
You can get debug log by running textlint with `DEBUG=textlint*` environment variable.
$ DEBUG=textlint* textlint target.md
# Please paste the debug log to the issue or use http://gist.github.com/
--->
## 再現手順

例)

1. `npm install -g textlint`
2. `npm install -g textlint-rule-no-todo`
3. 下記のように実行したらエラーがでた

```
textlint --rule no-todo README.md
```

**Hint** :information_source:

`DEBUG=textlint*`を指定するとデバッグ情報も出力されるので合わせて書いてあると嬉しいです。

```
DEBUG=textlint* textlint --rule no-todo README.md
```

対象となるファイル(`README.md`部分)がどのファイルでも同じエラーになるのか、
それとも特定のファイルだけでエラーになるのかも合わせて書かれていると嬉しいです。

## 意図した結果

例) ちゃんとLintができる

## 実際の結果

例) 以下のようなエラーが表示される(全文)

```
TypeError: Super expression must either be null or a function, not object
...
...
```

`--fix` による修正結果が壊れているなら、

```
textlint --fix --dry-run -f json [file]
```

で出力したJSON文字列と対象のファイル内容も一緒に書いてみてください。　
このJSONによって、textlintのバグなのか、ルールのバグなのかが判定できます。

----

From https://github.com/textlint/textlint/blob/master/CONTRIBUTING.md#bug-reporting
