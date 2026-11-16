# ルールのテスト

[English](requirements.md)

## この文書について

ルールのテストは、ルール作者がルールパッケージのテストを 1 つのコマンド `textlint-scripts test` で実行できるようにする。
テストは、たいてい `textlint-tester` を使って JavaScript か TypeScript で書かれる。
親の Product は [textlint](../../product.ja.md) である。

ルールパッケージは小さく、作者はたいてい多くのパッケージを保守している。
そのため、作者が `textlint-scripts` を更新しても、パッケージごとに変更しなくてもコマンドが動き続ける必要がある。
また、ルールパッケージが大きなテストフレームワークを依存に持ち込まないよう、コマンドは小さく保つ必要がある。

### 範囲

- `textlint-scripts test` コマンド：実行するファイル、ファイルのトランスパイル、TypeScript の型チェック、終了コード
- テストファイルが import せずに使えるテスト関数
- 他のツールが同じファイルを実行するために読み込む register スクリプト `textlint-scripts/register` と `textlint-scripts/register-ts`

### 範囲外

- `textlint-tester` がルールをチェックするしかた。`textlint-tester` は、ここで定めるテスト関数があればそれを使う
- `textlint-scripts build` と `textlint-scripts init`
- 作者が自分でインストールして直接実行するテストランナー（Mocha や Vitest など）

## ユーザーストーリー

### 1 つのコマンドでルールパッケージをテストする

ルール作者として、ルールパッケージのすべてのテストを `textlint-scripts test` で実行したい。パッケージごとにテストランナーを設定しなくて済むようにするためだ。

**受け入れ条件：**

シナリオ：テストが通るとき、コマンドは成功する

- Given: `test/` に `textlint-tester` で書いたテストファイルがあり、すべてのテストが通るルールパッケージ
- When: 作者が `textlint-scripts test` を実行する
- Then: 各テストが結果とともに表示され、コマンドは終了コード 0 で終わる

シナリオ：テストが失敗するとき、コマンドは失敗する

- Given: 期待するエラーが一致しないテストがあるルールパッケージ
- When: 作者が `textlint-scripts test` を実行する
- Then: 失敗したテスト、期待値、実際の値が表示され、コマンドは 0 以外の終了コードで終わる

シナリオ：テストファイルがテストを定義する途中で例外を投げるとき、コマンドは失敗する

- Given: `describe` の関数が例外を投げるテストファイル。たとえば `textlint-tester` がオプションを受け付けない場合
- When: 作者が `textlint-scripts test` を実行する
- Then: エラーが失敗したテストとして表示され、コマンドは 0 以外の終了コードで終わる

### TypeScript でテストを書く

TypeScript で書くルール作者として、テストとソースを型チェックし、別にビルドせずに実行したい。型エラーがリリースに入らないようにするためだ。

**受け入れ条件：**

シナリオ：プロジェクトに型エラーがあるとき、テストは実行されない

- Given: `tsconfig.json` があり、ソースかテストのファイルに型エラーがあるルールパッケージ
- When: 作者が `textlint-scripts test` を実行する
- Then: 型エラーが表示され、テストは 1 つも実行されず、コマンドは 0 以外の終了コードで終わる

シナリオ：型が正しいとき、TypeScript のテストはビルドなしで実行される

- Given: `tsconfig.json` があり、`test/index.test.ts` が `../src/index` をファイルの拡張子なしで import するルールパッケージ
- When: 作者が `textlint-scripts test` を実行する
- Then: `test/index.test.ts` のテストが `src/` のソースに対して実行される

### 既存のテストを動かし続ける

多くのパッケージを持つルール作者として、Mocha を使う `textlint-scripts test` 向けに書いたテストが通り続けてほしい。パッケージごとに編集せずに `textlint-scripts` を更新できるようにするためだ。

**受け入れ条件：**

シナリオ：テストが Mocha 形式のグローバルを使うとき、実行される

- Given: `describe`、`it`、`before`、`beforeEach` を import せずに使うテストファイル
- When: 作者が `textlint-scripts test` を実行する
- Then: テストとフックが Mocha と同じ順番で実行される

シナリオ：テストが `done` コールバックを受け取るとき、テストはその呼び出しを待つ

- Given: テスト関数 `function (done) { setTimeout(done, 10); }`
- When: 作者が `textlint-scripts test` を実行する
- Then: `done` が呼ばれた後にテストは成功し、`done` がエラーとともに呼ばれたときは失敗する

シナリオ：パッケージに Mocha の設定ファイルがあるとき、読まれないことが作者に伝わる

- Given: `.mocharc.json` があるルールパッケージ
- When: 作者が `textlint-scripts test` を実行する
- Then: 警告がそのファイル名を示し、オプションを引数で渡すよう案内し、テストは実行される

### エディターからテストを実行する

ルール作者として、エディターから 1 つのテストファイルを同じトランスパイルで実行したい。ルールをデバッグするためだ。

**受け入れ条件：**

シナリオ：テストランナーが register スクリプトを読み込むとき、テストファイルはトランスパイルされる

- Given: 作者がインストールしたテストランナー（Mocha など）を `--require textlint-scripts/register` 付きで起動する
- When: ランナーが `import` と TypeScript の構文を使うテストファイルを読み込む
- Then: ファイルは `textlint-scripts test` のときと同じように実行される

シナリオ：両方の register スクリプトを読み込むとき、ファイルは 1 回だけトランスパイルされる

- Given: `--require textlint-scripts/register` と `--require textlint-scripts/register-ts` 付きで起動したテストランナー
- When: ランナーが TypeScript のテストファイルを読み込む
- Then: トランスパイラーが出力したコードについてのエラーなしに、ファイルが実行される

## KPI

### 変更なしで通る既存のルールパッケージ

- **目標値：** サンプルのルールパッケージのうち、前のリリースでテストが通るものは、すべて新しいリリースでも同じテスト数で通ること。
- **測定方法：** `textlint-scripts test` を使う公開されたルールパッケージ（JavaScript と TypeScript の両方を含む）のサンプルで、両方のリリースの `textlint-scripts test` を実行し、結果を比べる。
- **測定時期：** `textlint-scripts test` がファイルの実行やトランスパイルのしかたを変えるとき。

### テストフレームワークへの依存

- **目標値：** `textlint-scripts` はどのテストフレームワークにも依存しない。テストは Node.js のテストランナーで実行する。
- **測定方法：** パッケージの `dependencies` と `peerDependencies` を読む。
- **測定時期：** パッケージの依存を変えるとき。

## 機能要件

### ルールパッケージのテストを実行する

`textlint-scripts test` は、カレントディレクトリのルールパッケージのテストファイルを実行し、テストが 1 つでも失敗すれば 0 以外の終了コードで終わる。

#### 適用条件

##### テストファイル

- テストファイルは `test/**/*.js` である。カレントディレクトリに `tsconfig.json` があるときは、`test/**/*.ts` もテストファイルである。
- 各テストファイルは Node.js のテストランナー（`node:test`）で実行され、各テストの結果が表示される。
- `textlint-scripts test` の後の引数は、`--test-timeout`、`--test-name-pattern`、`--watch` などとして Node.js のテストランナーに渡される。
- `--test-timeout` を指定しないとき、各テストは 10 秒でタイムアウトする。

##### トランスパイル

- テストファイルと、それが import するファイルは、読み込むときに `textlint-scripts build` と同じ Babel のプリセットでトランスパイルされる。
- ファイルの拡張子がない相対パスの `import` は、`textlint-scripts build` と同じように `.js` または `.ts` のファイルに解決される。
- テストファイルと、`import` を使うソースファイルで、`__dirname` と `require` が使える。

##### 型チェック

- `tsconfig.json` があるときは、テストの前に `tsc -p tsconfig.json` を実行する。失敗したときはテストを実行せず、その終了コードで終わる。
- トランスパイルは型チェックをしない。そのため、テストの結果は型チェッカーに左右されない。

##### テスト関数

次の関数は、テストファイルのグローバルである。ただし、別のテストフレームワークがすでに定義している場合を除く。

| グローバル | 挙動 |
| --- | --- |
| `describe`、`context` | スイートを定義する。`.only` と `.skip` が使える |
| `it`、`specify` | テストを定義する。`.only` と `.skip` が使える |
| `before`、`after`、`beforeEach`、`afterEach` | 現在のスイートのフックを定義する。最初の引数に名前を渡してもよい |

- 引数を持つテスト関数やフック関数は、コールバック形式の関数である。コールバックが呼ばれたときに終わり、コールバックがエラーとともに呼ばれたときに失敗する。
- テスト関数やフック関数の中で、`this.skip()` はテストをスキップし、`this.timeout()` と `this.slow()` は何もしない。
- スイートの関数が例外を投げたときは、そのエラーはそのスイートの失敗したテストになる。

#### 例外時の挙動

##### Mocha の設定ファイル

`.mocharc.js`、`.mocharc.cjs`、`.mocharc.yaml`、`.mocharc.yml`、`.mocharc.jsonc`、`.mocharc.json`、`test/mocha.opts` は読まない。
どれかがあるときは、警告がそのファイル名を示し、オプションを引数で渡す方法を示す。テストはいつもどおり実行される。

##### テストファイルがない

テストファイルのパターンに一致するファイルがないときは、エラーがパターンを示し、テストは実行されず、コマンドは 0 以外の終了コードで終わる。

### register スクリプトを提供する

`textlint-scripts/register` は、[トランスパイル](#トランスパイル) を現在の Node.js のプロセスに組み込み、他のツールが同じファイルを読み込めるようにする。

#### 適用条件

- `textlint-scripts/register-ts` は `textlint-scripts/register` と同じである。型チェックはしない。
- 1 つのプロセスで register スクリプトを何度読み込んでも、トランスパイルは 1 回だけ組み込まれる。
- register スクリプトはテスト関数を定義しない。一緒に読み込まれたテストランナーが自分のものを提供する。

## データ要件

### 必要なデータ

なし。コマンドはルールパッケージのテストファイル、ソースファイル、`tsconfig.json` を読む。

### 関係

なし。

### 個人情報

なし。

## 外部サービスへの依存

なし。コマンドはネットワークを使わない。

## セキュリティの考慮事項

コマンドは、ルールパッケージとその依存のコードを作者の権限で実行する。
実行するのは、カレントディレクトリのうちテストファイルのパターンに一致するファイルと、それらが import するファイルだけである。

## 未解決事項

- **Babel を使わずに TypeScript を実行すること：** Node.js は型を取り除いて TypeScript を実行できるが、ファイルの拡張子がない `import` を解決せず、`import` を使うファイルには `__dirname` がない。ほとんどのルールパッケージはこの両方に依存している。ルールパッケージがファイルごとに編集せずに移行できるようになるまでは、Babel がファイルをトランスパイルする。移行ツールがこうした import と `__dirname` を書き換えられるようになったとき、または `textlint-scripts build` が Babel を使わなくなったときに見直す。azu が決める。
- **`textlint-tester` のテスト関数：** `textlint-tester` は、グローバルの `describe` と `it` があればそれを使い、なければチェックを直接実行する。`textlint-tester` 自身が `node:test` を使うまでは、`textlint-scripts test` がグローバルを提供する。`textlint-tester` がテストを定義するしかたを変えるときに見直す。azu が決める。
