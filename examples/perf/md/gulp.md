# gulp

> この文章は[gulp](http://gulpjs.com/ "gulp") 3.9.0を元に書かれています。

[gulp](http://gulpjs.com/ "gulp")はNode.jsを使ったタスク自動化ツールです。
ビルドやテストなどといったタスクを実行するためのツールで、
それぞれのタスクをJavaScriptで書くことができるようになっています。

タスクは複数の処理の実行順序を定義したものとなっていて、タスクを定義するAPIとしては`gulp.task`が用意されています。
また、それぞれの処理はNode.jsの[Stream](https://nodejs.org/api/stream.html "Stream")でつなげることで、複数の処理を一時ファイルなしでできるようになっています。

それぞれの処理はgulpのプラグインという形でモジュール化されているため、
利用者はモジュールを読み込み、`pipe()`で繋ぐだけでタスクの定義ができるツールとなっています。

## どう書ける?

例えば、[Sass](http://sass-lang.com/ "Sass")で書いたファイルを次のように処理したいとします。

1. `sass/*.scss`のファイルを読み込む
2. 読み込んだsassファイルを`sass`でコンパイル
3. CSSとなったファイルに`autoprefixture`で接頭辞をつける
4. CSSファイルをそれぞれ`minify`で圧縮する
5. 圧縮したCSSファイルをそれぞれ`css`ディレクトリに出力する

この一連の処理は以下のようなタスクとして定義することができます。

```js
import gulp from "gulp";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import minify from "gulp-minify-css";

gulp.task("sass", function() {
    return gulp.src("sass/*.scss")
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(minify())
        .pipe(gulp.dest("css"));
});
```

ここでは、gulpプラグインの仕組みについて扱うので、gulpの使い方については詳しくは以下を参照してください。

- [gulp/docs at master · gulpjs/gulp](https://github.com/gulpjs/gulp/tree/master/docs)
- [現場で使えるgulp入門 - gulpとは何か | CodeGrid](https://app.codegrid.net/entry/gulp-1)
- [gulp入門 (全12回) - プログラミングならドットインストール](http://dotinstall.com/lessons/basic_gulp)

## どういう仕組み?

実際にgulpプラグインを書きながら、どのような仕組みで処理同士が連携を取って動作しているのかを見ていきましょう。

先ほどのgulpのタスクの例では、既にモジュール化された処理を`pipe`で繋げただけであるため、
それぞれの処理がどのように実装されているかはよく分かりませんでした。

ここでは`gulp-prefixer`という、それぞれのファイルに対して先頭に特定の文字列を追加するgulpプラグインを書いていきます。

同様の名前のプラグインが公式のドキュメントで「プラグインの書き方」の例として紹介されているので合わせて見ると良いでしょう。

- [gulp/docs/writing-a-plugin](https://github.com/gulpjs/gulp/tree/master/docs/writing-a-plugin "gulp/docs/writing-a-plugin at master · gulpjs/gulp")
- [gulp/dealing-with-streams.md](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/dealing-with-streams.md "gulp/dealing-with-streams.md at master · gulpjs/gulp")

多くのgulpプラグインはオプションを受け取り、NodeのStreamを返す関数として実装されます。

[import gulp-prefixer.js](../../src/gulp/gulp-prefixer.js)

ここで実装した`gulp-prefixer`は、次のようにしてタスクに組み込むことができます。

[import gulpfile.babel.js](../../src/gulp/gulpfile.babel.js)

この`default`タスクは次のような処理が行われます。

1. `./*.*`にマッチするファイルを取得(全てのファイル)
2. 取得したファイルの先頭に"prefix text"という文字列を追加する
3. 変更したファイルを`build/`ディレクトリに出力する

### Stream

[gulp-prefixer.js](#gulp-prefixer.js)を見てみると、`gulpPrefixer`という[Transform Stream](https://nodejs.org/api/stream.html#stream_class_stream_transform "stream.Transform")のインスタンスを返していることが分かります。

```js
let gulpPrefixer = function (prefix) {
    // enable `objectMode` of the stream for vinyl File objects.
    return new Transform({
        // Takes in vinyl File objects
        writableObjectMode: true,
        // Outputs vinyl File objects
        readableObjectMode: true,
        transform: function (file, encoding, next) {
            if (file.isBuffer()) {
                file.contents = prefixBuffer(file.contents, prefix);
            }

            if (file.isStream()) {
                file.contents = file.contents.pipe(prefixStream(prefix));
            }
            this.push(file);
            next();
        }
    });
};

export default gulpPrefixer;
```

Transform Streamというものが出てきましたが、Node.jsのStreamは次の4種類があります。

- Readable Stream
- Transform Stream
- Writable Stream
- Duplex Stream

今回の`default`タスクの処理をそれぞれ当てはめると次のようになっています。

1. `./*.*`にマッチするファイルを取得 = Readable Stream
2. 取得したファイルの先頭に"prefix text"という文字列を追加する = Transform Stream
3. 変更したファイルを `build/` ディレクトリに出力する = Writable Stream

あるファイルを _Read_ して、 _Transform_ したものを、別のところに _Write_ としているというよくあるデータの流れと言えます。

[gulp-prefixer.js](#gulp-prefixer.js)では、gulpから流れてきたデータをStreamで受け取り、
そのデータを変更したもの次へ渡すTransform Streamとなっています。

「gulpから流れてきたデータ」を扱うために`readableObjectMode`と`writableObjectMode`をそれぞれ`true`にしています。
この _ObjectMode_ というのは名前の通り、Streamでオブジェクトを流すための設定です。

通常のNode.js Streamは[Buffer](https://nodejs.org/api/buffer.html "Buffer")というバイナリーデータを扱います。
この[Buffer](https://nodejs.org/api/buffer.html "Buffer")はStringと相互変換が可能ですが、複数の値を持ったオブジェクトのようなものは扱えません。

そのため、Node.js Streamには[Object Mode](https://nodejs.org/api/stream.html#stream_object_mode "Object Mode")があり、これが有効の場合はBufferやString以外のJavaScriptオブジェクトをStreamで流せるようになっています。

Node.js Streamについては以下を合わせて参照するといいでしょう。

- [Stream Node.js Manual & Documentation](https://nodejs.org/api/stream.html "Stream Node.js Manual &amp; Documentation")
- [substack/stream-handbook](https://github.com/substack/stream-handbook "substack/stream-handbook")

### vinyl

gulpでは[vinyl](https://github.com/gulpjs/vinyl "vinyl")オブジェクトがStreamで流れてきます。
このvinylは _Virtual file format_ という呼ばれているもので、ファイル情報と中身をラップしたgulp用に作成された抽象フォーマットです。

なぜこういった抽象フォーマットが必要なのかは次のことを考えてみると分かりやすいと思います。

`gulp.src`で読み込んだファイルの中身のみが、Transform Streamに渡されてしまうと、
Transform Streamからはそのファイルのパスや読み取り属性などの詳細な情報を知ることができません。

そのため、`gulp.src`で読み込んだファイルはvinylでラップされ、ファイルの中身は`contents`として参照できるようになっています。

### vinylの中身を処理する

先ほどのTransform Streamの中身を見てみましょう。

```js
// file は `vinyl` オブジェクト
if (file.isBuffer()) {
    file.contents = prefixBuffer(file.contents, prefix);
}

if (file.isStream()) {
    file.contents = file.contents.pipe(prefixStream(prefix));
}
```

`vinyl`抽象フォーマットの`contents`プロパティには、読み込んだファイルのBufferまたはStreamが格納されています。
そのため両方のパターンに対応したコードする場合はどちらが来ても問題ないように書く必要があります。

> **NOTE**: gulp pluginは必ずしも両方のパターンに対応しないといけないのではなく、Bufferだけに対応したものも多いです。しかし、その場合にStreamが来た時のErrorイベントを通知することがガイドラインで推奨されています。 - [gulp/guidelines.md at master · gulpjs/gulp](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md "gulp/guidelines.md at master · gulpjs/gulp")

`contents`にどちらのタイプが格納されているかは、ひとつ前のStreamで決定されます。

```js
gulp.src("./*.*")
    .pipe(gulpPrefixer("prefix text"))
    .pipe(gulp.dest("build"));
```

この場合は、`gulp.src`により決定されます。
`gulp.src`はデフォルトでは、`contents`にBufferを格納するので、この場合はBufferで処理されることになります。

`gulp.src`はオプションに`{ buffer: false }`を渡すことで`contents`にStreamを流すことも可能です。

```js
gulp.src("./*.*", { buffer: false })
        .pipe(gulpPrefixer("prefix text"))
        .pipe(gulp.dest("build"));
```

### 変換処理

最後にBufferとStreamのそれぞれの変換処理を見てみます。

```js
export function prefixBuffer(buffer, prefix) {
    return Buffer.concat([Buffer(prefix), buffer]);
}

export function prefixStream(prefix) {
    return new Transform({
        transform: function (chunk, encoding, next) {
            // ObjectMode:falseのTransform Stream
            // StreamのchunkにはBufferが流れてくる
            let buffer = prefixBuffer(chunk, prefix);
            this.push(buffer);
            next();
        }
    });
}
```

やってきたBufferの先頭に`prefix`の文字列をBufferとして結合して返すだけの処理が行われています。

この変換処理自体は、gulpに依存したものはないため、通常のライブラリに渡して処理するということが可能です。
BufferはStringと相互変換が可能であるため、多くのgulpプラグインと呼ばれるものは、`gulpPrefixer`と`prefixBuffer`にあたる部分だけを実装しています。

つまり、prefixを付けるといった変換処理自体は、既存のライブラリで行うことができるようになっています。

gulpプラグインの仕組みは[vinyl](https://github.com/gulpjs/vinyl "vinyl")オブジェクトのデータをプラグイン同士でやり取りすることで入力/変換/出力を行い、
そのインタフェースとして既存のNode.js Streamを使っていると言えます。

## エコシステム

gulpのプラグインが行う処理は「入力に対して出力を返す」が主となっています。
この受け渡すデータとして[vinyl](https://github.com/gulpjs/vinyl "vinyl")オブジェクトを使い、受け渡すAPIのインタフェースとしてNode.js Streamを使っています。

gulpではプラグインは単機能であること推奨しています。

> Your plugin should only do one thing, and do it well. 
> -- [gulp/guidelines.md](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md "gulp/guidelines.md at master · gulpjs/gulp")

gulpは既存のNode.js Streamに乗ることで独自のAPIを使わずに解決しています。

元々、Transform Streamは1つの変換処理を行うことに向いていて、その変換処理を`pipe`を繋げることで複数の処理を行う事できます。

また、gulpはタスク自動化ツールであるため、既存のライブラリをそのままタスクとして使いやすくすることが重要だと言えます。
Node.js Streamのデフォルトでは流れるデータが`Buffer`であるため、そのままでは既存のライブラリでは扱いにくい問題を
データとして[vinyl](https://github.com/gulpjs/vinyl "vinyl")オブジェクトを流す事で緩和しています。

このようにして、gulpはタスクに必要な単機能のプラグインを既存のライブラリを使って作りやすくしています。
これにより再利用できるプラグインが多くできることでエコシステムを構築していると言えます。

## どういう用途に向いている?

gulpはそれ自体はデータの流れを管理するだけであり、タスクを実現するためにはプラグインが重要になります。
タスクには様々な処理が想定されるため、必要になるプラグインも種類が様々なものとなります。

gulpでは[vinyl](https://github.com/gulpjs/vinyl "vinyl")オブジェクトを中間フォーマットと決めたことで、
既存のライブラリをラップしただけのプラグインが作りやすくなっています。

またgulpは、Gruntとは異なり、タスクをJavaScriptのコードして表現します。
これにより、プラグインの組み合わせだけだと実現できない場合に、直接コードを書くことで対応するといった対処法を取ることができます。

そのため、プラグインの行う処理の範囲が予測できない場合に、gulpのように中間フォーマットとデータの流し方だけを決めるというやり方は向いています。

まとめると

- 既存のライブラリをプラグイン化しやすい
- 必要なプラグインがない場合も、設定としてコードを書くことで対応できる

## どういう用途に向いていない?

プラグインを複数組み合わせ扱うものに共通することですが、プラグインの組み合わせの問題はgulpでも発生します。

例えば、[Browserify](https://github.com/substack/node-browserify)はNode.js Streamを扱えますが、
先頭に置かないと他のプラグインと組わせて利用できない問題があります。

- [gulp/browserify-transforms.md at master · gulpjs/gulp](https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-transforms.md "gulp/browserify-transforms.md at master · gulpjs/gulp")

また、gulpは単機能のプラグインを推奨していますが、これはAPIとしてそういう制限があるわけではないためあくまでルールとなっています。

このような問題に対してgulpはガイドラインやレシピといったドキュメントを充実させることで対処しています。

- [gulp/docs at master · gulpjs/gulp](https://github.com/gulpjs/gulp/tree/master/docs "gulp/docs at master · gulpjs/gulp")

既存のライブラリをプラグイン化しやすい一方、
プラグインとライブラリのオプションが異なったり、利用者はプラグイン化したライブラリの扱い方を学ぶ必要があります。

ライブラリとプラグインの作者が異なるケースも多いため、同様の機能を持つプラグインが複数できたり、質もバラバラとなりやすいです。

まとめると

- プラグインの組み合わせ問題は利用者が解決しないといけない
- 同様の機能を持つプラグインが生まれやすい

## この仕組みを使っているもの

- [sighjs/sigh](https://github.com/sighjs/sigh "sighjs/sigh")
    - gulpプラグインそのものをサポートしています。

## まとめ

ここではgulpのプラグインアーキテクチャについて学びました。

- gulpはタスク自動化ツール
- JavaScriptで設定を書くことができる
- gulpは中間フォーマットとデータの流れを決めている
- 中間フォーマットは[vinyl](https://github.com/gulpjs/vinyl "vinyl")オブジェクト
- データの流れは既存のNode.js Stream
- 既存のライブラリをラップしたプラグインが作りやすい
- 同様の機能を持つプラグインが登場しやすい