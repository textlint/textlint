# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)


# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)
# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)

# Connect

> この文章は[Connect](https://github.com/senchalabs/connect "Connect") 3.4.0を元に書かれています。

[Connect](https://github.com/senchalabs/connect "Connect")はNode.jsで動くHTTPサーバーフレームワークです。
_middleware_という拡張する仕組みを持っていて、Connectが持つ機能自体はとても少ないです。

この章ではConnectの_middleware_の仕組みについて見て行きましょう。

## どう書ける?

Connectを使った簡単なEchoサーバを書いてみましょう。
Echoサーバとは、送られてきたリクエストの内容をそのままレスポンスとして返すサーバのことです。

[import, connect-echo-example.js](../../src/connect/connect-echo-example.js)

このEchoサーバに対して、以下のようなリクエストBodyを送信すると、レスポンスとして同じ値が返ってきます。

```json
{
    "key": "value"
}
```

`app.use(middleware)` という形で、_middleware_と呼ばれる関数には`request`や`response`といったオブジェクトが渡されます。
この`request`や`response`を_middleware_で処理することでログを取ったり、任意のレスポンスを返したりできるようになっています。

Echoサーバでは `req.pipe(res);` という形でリクエストをそのままレスポンスとして流す事で実現されています。

### middlewareをモジュールとして実装

もう少し_middleware_をプラグインらしくモジュールとして実装したものを見てみます。

次の[connect-example.js](#connect-example.js)は、あらゆるリクエストに対して、
`"response text"`というレスポンスを`"X-Content-Type-Options"`ヘッダを付けて返すだけのサーバです。

それぞれの処理を_middleware_としてファイルを分けて実装し、`app.use(middleware)`で処理を追加しています。


[import nosniff.js](../../src/connect/nosniff.js)

[import hello.js](../../src/connect/hello.js)

[import errorHandler.js](../../src/connect/errorHandler.js)

[import connect-example.js](../../src/connect/connect-example.js)

基本的にどの_middleware_も`app.use(middleware)`という形で拡張でき、
モジュールとして実装すれば再利用もしやすい形となっています。

> **Note** _middleware_となる関数の引数が4つであると、それはエラーハンドリングの_middleware_とするという、Connect独自のルールがあります。

## どういう仕組み

Connectの_middleware_がどのような仕組みで動いているのかを見ていきます。

`app`に登録した_middleware_は、リクエスト時に呼び出されています。
そのため、`app`のどこかに利用する_middleware_を保持していることは推測できると思います。

Connectでは`app.stack`に_middleware_を配列として保持しています。
次のようにして`app.stack`の中身を表示してみると、_middleware_が登録順で保持されていることがわかります。

[import connect-trace-example.js](../../src/connect/connect-trace-example.js)

Connectが登録された_middleware_をどう処理するかというと、
サーバがリクエストを受け取った時に、それぞれ順番に呼び出しています。

上記の例だと以下の順番で_middleware_が呼び出されることになります。

- nosniff
- hello
- errorHandler

エラーハンドリングの_middleware_は処理中にエラーが起きた時のみ呼ばれます。

そのため、通常は [nosniff.js](#nosniff.js) → [hello.js](#hello.js) の順で呼び出されます。

[import nosniff.js](../../src/connect/nosniff.js)

`nosniff.js`は、HTTPヘッダを設定し終わったら`next()`を呼び出していて、
この`next()`が次の_middleware_へ行くという意味になります。

次に、`hello.js`を見てみると、`next()`がないことがわかります。

[import hello.js](../../src/connect/hello.js)

`next()`がないということは`hello.js`がこの連続する_middleware_の最後となっていることがわかります。
仮に、これより先に_middleware_が登録されていたとしても無視されます。

つまり、処理的には以下のようにstackを先頭から一個づつ取り出して、処理していくという方法が取られています。

Connectの行っている処理を抽象的なコードで書くと以下のような形となっています。

```js
let req = "...",
    res = "...";
function next(){
    let middleware = app.stack.shift();
    // nextが呼ばれれば次のmiddleware
    middleware(req, res, next);
}
next();// 初回
```


このような_middleware_を繋げた形を_middleware stack_と呼ぶことがあります。

_middleware stack_で構成されるHTTPサーバとして、PythonのWSGI MiddlewareやRubyのRackなどがあります。
ConnectはRackと同じく`use`で_middleware_を指定することからも分かりますが、
Rackを参考にして実装されています。

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5 "Ruby - Rack解説 - Rackの構造とRack DSL - Qiita")

次は、先ほど抽象的なコードとなっていたものを具体的な実装にしながら見ていきます。

## 実装してみよう

JunctionというConnectライクな_middleware_をサポートしたものを作成してみます。

Junctionは、`use(middleware)` と `process(value, (error, result) => { });`を持っているシンプルなクラスです。

[import junction.js](../../src/connect/junction.js)

実装を見てみると、`use`で_middleware_を登録して、`process`で登録した_middleware_を順番に実行していきます。
そのため、`Junction`自体は渡されたデータは何も処理せずに、_middleware_との中継のみをしています。

登録する_middleware_はConnectと同じで、処理をしたら`next`を呼んで、次の_middleware_が処理するというのを繰り返しています。

使い方はConnectと引数の違いはありますが、ほぼ同じような形で利用できます。

[import junction-example.js](../../src/connect/junction-example.js)


## どういう用途に向いている?

ConnectやJunctionの実装を見てみると分かりますが、このアーキテクチャでは機能の詳細は_middleware_で実装できます。
そのため、本体の実装は_middleware_に提供するインタフェースの決定、エラーハンドリングの手段の提供するだけでとても小さいものとなっています。

今回は紹介していませんが、Connectにはルーティングに関する機能があります。
しかし、この機能も「与えられたパスにマッチした場合のみに反応する_middleware_を登録する」という単純なものです。

```js
app.use("/foo", function fooMiddleware(req, res, next) {
    // req.url starts with "/foo"
    next();
});
```

このアーキテクチャは、入力があり出力がある場合にコアとなる部分は小さく実装できることが分かります。

そのため、ConnectやRackなどのHTTPサーバでは「リクエストに対してレスポンスを返す」というのが決まっているので、
このアーキテクチャは適しています。

## どういう用途に向いていない?

このアーキテクチャでは機能の詳細が_middleware_で実装できます。
その中で多くの機能を_middleware_で実装していくと、_middleware_間に依存関係が生じることがあります。

これにより、`use(middleware)` で登録する順番が変わるだけで挙動が変わる事があります。
_middleware_は柔軟ですが、_middleware_間で起きる前提の解決を利用者が行う必要があります。

そのため、プラグイン同士の強い独立性や明確な依存関係を扱いたい場合には不向きといえるでしょう。

これらを解消するためにコアはそのままにして、最初から幾つかの_middleware stack_を作ったものが提供されるケースもあります。

## エコシステム

Connect自体の機能は少ないため、その分_middleware_が多くあるのが特徴的です。

- [github.com/senchalabs/connect#middleware](https://github.com/senchalabs/connect#middleware)
- [Express middleware](http://expressjs.com/resources/middleware.html "Express middleware")

また、それぞれの_middleware_が小さな単機能であり、それを組み合わせて使うように作られているケースが多いです。

これは、_middleware_が層となっていてそれを重ねていく作り、つまり_middleware stack_の形を取ることが多いからであるとも言えます。

![pylons_as_onion](img/pylons_as_onion.png)

> ミドルウェアでラップするプロセスは、概念的にたまねぎの中の層と同様の構造をもたらします。
> [WSGI ミドルウェア](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html#wsgi-middleware "WSGI ミドルウェア")より引用


## この仕組みを使っているもの

- [Express](http://expressjs.com/ "Express")
    - Connectと_middleware_の互換性がある
    - 元々はConnectを利用していたが[4.0.0](https://github.com/strongloop/express/blob/4.0.0/History.md "4.0.0")で自前の実装に変更
- [wooorm/retext](https://github.com/wooorm/retext "wooorm/retext")
    - `use`でプラグインを登録していくテキスト処理ライブラリ
- [r7kamura/stackable-fetcher](https://github.com/r7kamura/stackable-fetcher "r7kamura/stackable-fetcher")
    - `use`でプラグインを登録して処理を追加できるHTTPクライアントライブラリ

## まとめ

ここではConnectのプラグインアーキテクチャについて学びました。

- Connectは_middleware_を使ったHTTPサーバーライブラリである
- Connect自体は機能は少ない
- 複数の_middleware_を組み合わせてアプリケーションを作ることができる

## 参考資料

- [Ruby - Rack解説 - Rackの構造とRack DSL - Qiita](http://qiita.com/higuma/items/838f4f58bc4a0645950a#2-5)
- [Pylons のコンセプト — Pylons 0.9.7 documentation](http://docs.pylonsproject.org/projects/pylons-webframework/en/v1.0.1rc1/concepts.html)
