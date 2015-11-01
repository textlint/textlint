# ESLint

> この文章は[ESLint](http://eslint.org/ "ESLint") 1.3.0を元に書かれています。

[ESLint](http://eslint.org/ "ESLint")はJavaScriptのコードをJavaScriptで書かれたルールによって検証するLintツールです。

大まかな動作としては、検証したいJavaScriptのコードをパースしてできたAST(抽象構文木)をルールで検証し、エラーや警告を出力します。

このルールがプラグインとして書けるようになっていて、ESLintの全てのルールがプラグインとして実装されています。

> The pluggable linting utility for JavaScript and JSX

ESLintサイト上には、上記のように書かれていることからもわかりますが、プラグインに重きを置いた設計となっています。

今回はESLintのプラグインアーキテクチャがどうなっているかを見て行きましょう。

## どう書ける?

ESLintでは`.eslintrc`という設定ファイルに利用するルールの設定をして使うため、
実行方法についてはドキュメントを参照してください。

- [Documentation - ESLint - Pluggable JavaScript linter](http://eslint.org/docs/user-guide/configuring "Documentation - ESLint - Pluggable JavaScript linter")

ESLintにおけるルールとは、以下のような1つのオブジェクトを返す関数をexportしたモジュールのことを言います。

[import, no-console.js](../../src/ESLint/no-console.js)

ESLintではコードを文字列ではなくASTを元にしてチェックしていきます。
ASTについてはここでは詳細を省きますが、コードをJavaScriptのオブジェクトで表現した木構造のデータだと思えば問題ないと思います。

例えば、

```js
console.log("Hello!");
```

というコードをパースしてASTにすると以下のようなオブジェクトとして取得できます。

```json
{
    "type": "Program",
    "body": [
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "Identifier",
                        "name": "console"
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "log"
                    }
                },
                "arguments": [
                    {
                        "type": "Literal",
                        "value": "Hello!",
                        "raw": "\"Hello!\""
                    }
                ]
            }
        }
    ],
    "sourceType": "script"
}
```

- [JavaScript AST explorer](http://felix-kling.de/esprima_ast_explorer/#/FNrLHi8ngW "JavaScript AST explorer")

ESLintではこのASTを使って、変数が未使用であるとか[no-console.js](#no-console.js)のように`console.log`などがコードに残ってないか
といったことをルールを元にチェックすることができます。

ルールをどう書けるかという話に戻すと、`context`というオブジェクトはただのユーティリティ関数と思ってもらって問題なくて、
returnしてるメソッドをもったオブジェクトがルールの本体と言えます。

ESLintではルールをどうやって使っているかというと、ASTを深さ優先で探索していきます。
そして、ASTを探索しながら「`"MemberExpression"` typeのNodeに到達した」と登録したルールに対して通知することを繰り返しています。

先ほどの`console.log`のASTにおける`MemberExpression` typeのNodeとは以下のオブジェクトのことを言います。

```json
{
    "type": "MemberExpression",
    "computed": false,
    "object": {
        "type": "Identifier",
        "name": "console"
    },
    "property": {
        "type": "Identifier",
        "name": "log"
    }
}
```

[no-console.js](#no-console.js)のルールを見ると`MemberExpression` typeのNodeが `node.object.name === "console"` であるなら
`console`が残ってると判断してエラーレポートすると読めてくると思います。

ASTの探索がイメージしにくい場合は以下のルールで探索の動作を見てみると分かりやすいかもしれません。

- [azu.github.io/visualize_estraverse/](http://azu.github.io/visualize_estraverse/ "visualize estraverse step")

```js
function debug(string){
    console.log(string);
}
debug("Hello");
```

<video controls>
<source src="./movie/traverse.webm" type="video/webm">
<source src="./movie/traverse.mp4" type="video/mp4">
<p>動画を再生するには、webmまたはmp4をサポートしたブラウザが必要です。</p>
</video> 

その他、ESLintのルールの書き方についてはドキュメントや以下の記事を見てみるといいでしょう。

- [Documentation - ESLint - Pluggable JavaScript linter](http://eslint.org/docs/developer-guide/working-with-rules "Documentation - ESLint - Pluggable JavaScript linter")
- [コードのバグはコードで見つけよう！｜サイバーエージェント 公式エンジニアブログ](http://ameblo.jp/principia-ca/entry-11837554210.html "コードのバグはコードで見つけよう！｜サイバーエージェント 公式エンジニアブログ")

## どういう仕組み?

ESLintはコードをパースしてASTにして、そのASTをJavaScriptで書いたルールでチェックしてレポートする
という大まかな仕組みは分かりました。

次に、このルールをプラグインとする仕組みがどのようにして動いているのか見て行きましょう。

ESLintのLintは次のような3つの手順で行われています。

1. ルール毎に使っている`Node.type`をイベント登録する
2. ASTをtraverseしながら、`Node.type`のイベントを発火する
3. ルールから`context.report()`された内容を集めて表示する

このイベントの登録と発火にはEventEmitterを使っていて、
ESLint本体に対してルールは複数あるので、典型的なPub/Subパターンとなっています。

擬似的なコードで表現すると以下のような流れでLintの処理が行われています。

```js
import {parse} from "esprima";
import {traverse} from "estraverse";
import {EventEmitter} from "events";

function lint(code){
    // コードをパースしてASTにする
    let ast = parse(code);
    // イベントの登録場所
    let emitter = new EventEmitter();
    let results = [];
    emitter.on("report", message => {
        // 3. のためのreportされた内容を集める
        results.push(message);
    });
    // 利用するルール一覧
    let ruleList = getAllRules();
    // 1. ルール毎に使っている`Node.type`をイベント登録する
    ruleList.forEach(rule => {
        // それぞれのルールに定義されているメソッド一覧を取得
        // e.g) MemberExpression(node){}
        // => {"MemberExpression" : function(node){}, ... } というオブジェクト
        let methodObject = getDefinedMethod(rule);
        Object.keys(methodObject).forEach(nodeType => {
            emitter.on(nodeType, methodList[nodeType]);
        });
    });
    // 2. ASTをtraverseしながら、`Node.type`のイベントを発火する
    traverse(ast, {
        // 1.で登録したNode.typeがあるならここで呼ばれる
        enter: (node) => {
            emitter.emit(node.type, node);
        },
        leave: (node) => {
            emitter.emit(`${node.type}:exit`, node);
        }
    });
    // 3. ルールから`context.report()`された内容を集めて表示する
    console.log(results.join("\n"));
}
```

Pub/Subパターンを上手く使うことで、ASTをtraverseするのが一巡のみでそれぞれのルールに対して
どういうコードであるかという情報が`emit`で通知できていることがわかります。

もう少し具体的にするため、実装して動かせるようなものを作ってこの仕組みについて見ていきます。

## 実装してみよう

今回は、ESLintのルールを解釈できるシンプルなLintの処理を書いてみます。

利用するルールは先ほども出てきた[no-console.js](#no-console.js)をそのまま使い、
このルールを使って同じようにJavaScriptのコードを検証できる`MyLinter`を書いてみます。

### MyLinter

MyLinterは単純な2つのメソッドを持つクラスとして実装しました。

- `MyLinter#loadRule(rule): void`
    - 利用するルールを登録する処理
    - `rule`は[no-console.js](#no-console.js)がexportしたもの
- `MyLinter#lint(code): string[]`
    - `code`を受け取りルールによってLintした結果を返す
    - Lint結果はエラーメッセージの配列とする

実装したものが以下のようになっています。

[import, src/ESLint/MyLinter.js](../../src/ESLint/MyLinter.js)

このMyLinterを使って、`MyLinter#load`で[no-console.js](#no-console.js)を読み込ませて、

```js
function add(x, y){
    console.log(x, y);
    return x + y;
}
add(1, 3);
```

というコードをLintしてみます。

[import, src/ESLint/MyLinter-example.js](../../src/ESLint/MyLinter-example.js)

コードには`console`という名前のオブジェクトが含まれているので、 _"Unexpected console statement."_ というエラーメッセージが取得出来ました。   

### RuleContext

もう一度、[MyLinter.js](#MyLinter.js)を見てみると、`RuleContext`というシンプルなクラスがあることに気づくと思います。

この`RuleContext`はルールから使えるユーティリティメソッドをまとめたもので、
今回は`RuleContext#report`というエラーメッセージをルールからMyLinterへ通知するものだけを実装しています。

ルールの実装の方を見てみると、直接オブジェクトをexportしてるわけではなく、
`context` つまり`RuleContext`のインスタンスを受け取っていることが分かると思います。

[import, no-console.js](../../src/ESLint/no-console.js)

このようにして、ルールは `context` という与えられたものだけを使うので、ルールがMyLinter本体の実装の詳細を知らなくても良くなります。

## どういう用途に向いている?

このプラグインアーキテクチャはPub/Subパターンを上手くつかっていて、
ESLintのように与えられたコードを読み取ってチェックするような使い方に向いています。

つまり、read-onlyなプラグインアーキテクチャとしてはパフォーマンスも期待できると思います。

また、ルールは `context` という与えられたものだけを使うようになっているため、ルールと本体が密結合にはなりにくいです。
そのため`context`に何を与えるかを決める事で、ルールが行える範囲を制御しやすいと言えます。

## どういう用途に向いていない?

逆に与えられたコード(AST)を書き換えするようなことをする場合には、
ルールを同時に処理を行うためルール間で競合するような変更がある場合に破綻してしまいます。

そのため、この仕組みに加えてもう1つ抽象レイヤーを設けないと対応は難しいと思います。

つまり、read-writeなプラグインアーキテクチャとしては単純にこのパターンだけでは難しい部分が出てくるでしょう。

> **NOTE** ESLint 2.0でautofixing、つまり書き換えの機能の導入が予定されています。
> これはルールからの書き換えのコマンドを`SourceCode`というオブジェクトに集約して、最後に実際の書き換えを行うという抽象レイヤーを設けています。
> - [Implement autofixing · Issue #3134 · eslint/eslint](https://github.com/eslint/eslint/issues/3134 "Implement autofixing · Issue #3134 · eslint/eslint")

## この仕組みを使っているもの

- [azu/textlint](https://github.com/azu/textlint "azu/textlint")
    - テキストやMarkdownをパースしてASTにしてLintするツール
   
## エコシステム

ESLintのルールはただのJavaScriptファイルであり、またESLintは主に開発時に使うツールとなっています。

ルール自体を[npm](https://www.npmjs.com/ "npm")で公開したり、ルールや設定をまとめたものをESLintでは"Plugin"と呼び、
こちらもnpmで公開して利用するのが一般的な使い方になっています。

また、ESLintはデフォルトで有効なルールはありません。
そのため、設定ファイルを作るか、[sindresorhus/xo](https://github.com/sindresorhus/xo "sindresorhus/xo")といったESLintのラッパーを利用する形となります。

ESLint公式の設定として`eslint:recommended`が用意されていて、これを`extends`することで推奨の設定を継承できます。

```json
{
    "extends": "eslint:recommended"
}
```

これらの設定自体もJavaScriptで表現できるため、設定もnpmで公開して利用できるようになっています。

- [Shareable Configs - ESLint - Pluggable JavaScript linter](http://eslint.org/docs/developer-guide/shareable-configs "Documentation - ESLint - Pluggable JavaScript linter")

コーディングルールが多種多様なように、ESLintで必要なルールも個人差があると思います。
そういったことに柔軟に対応できるようにするためでもあり、_The pluggable linting utility_を表現している仕組みとなってます。

設定なしで使えるのが一番楽ですが、そこが現実として難しいため柔軟な設定のしくみと設定を共有しやすい形を持っていると言えます。

## まとめ

ここではESLintのプラグインアーキテクチャについて学びました。

- ESLintはJavaScriptで書いたルールでチェックできる
- ASTの木構造を走査しながらPub/Subパターンでチェックする
- ルールは`context`を受け取る以外は本体の実装の詳細を知らなくて良い
- ルールがread-onlyだと簡単で効率的、read-writeとする場合は気を付ける必要がある
- ルールや設定値などがJavaScriptで表現でき、npmで共有できる作りになっている