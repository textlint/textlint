# Markdown のパース

[English](requirements.md)

## この文書について

Markdown のパースは、Markdown のテキストを TxtAST に変換します。ルールが文章をチェックし、正確な位置を報告できるようにするためです。
Markdown には仕様があるので、構文はノードにパースします。その中の自然言語はテキストのまま残し、ルールが扱います。
この機能は `@textlint/markdown-to-ast` が提供し、組み込みの `@textlint/textlint-plugin-markdown` が使います。
親の Product は [textlint](../../product.ja.md) です。

この文書は、Markdown のどの構文がどのノードになるか、そして各ノードのプロパティと位置を定義します。
共通のプロパティや位置の規約のように、すべての TxtAST が満たすことは [TxtAST](../txtast/requirements.ja.md) が定義します。

この文書では、拡張とは、CJK に配慮した強調のように、CommonMark と GFM の認識のしかたを 1 か所変えるもので、書き手がオプションで有効にするものを指します。
フレーバーとは、GFM のように、ツールが従う規則の全体を指します。パーサーは CommonMark と GFM の拡張という 1 つのフレーバーを読み、拡張はその一部を変えます。

### 範囲

- `parse(text, options)` 関数と、`@textlint/textlint-plugin-markdown` が `parse` に渡すオプション
- 書き手が有効にする拡張: CJK に配慮した強調
- どの拡張を有効にしたかを記録する `Document` の `syntaxExtensions` プロパティ
- Markdown の認識のしかたを決める仕様
- 各構文がなるノードと、そのプロパティと範囲
- どの仕様にもないために textlint が定義する構文: フロントマター、脚注、インラインの注
- 信頼できない文書でもパースを安全に保つための上限

### 範囲外

- プレーンテキストのパースと、プラグインが提供するほかの形式
- 文章を文や単語に分割すること。これはルールが、文の分割器や形態素解析器などを使って行う
- Markdown を HTML にレンダリングすること、AST から Markdown を書き戻すこと
- すべての形式で共通のプロパティと規約。[TxtAST](../txtast/requirements.ja.md) を参照

## ユーザーストーリー

### 文章だけをチェックする

書き手として、Markdown の構文を構文として認識してほしい。ルールが文をチェックし、マークアップに対して誤検知を報告しないようにするためです。
リンク、コード、フロントマターのように意味を持つ構文は、文字列の中に残らず、ノードになります。

**受け入れ条件：**

シナリオ：文にインラインの構文が含まれるとき、構文はノードになり、文章は `Str` に残る

- Given: 段落 `See [docs](https://example.com) and \`code\`.`
- When: テキストをパースする
- Then: 段落は `Str`、`Link`、`Str`、`Code`、`Str` の子を持ち、URL はどの `Str` にも含まれない

シナリオ：文書がフロントマターで始まるとき、フロントマターは 1 つのノードになる

- Given: `---` で囲まれた YAML のブロックで始まる文書
- When: テキストをパースする
- Then: `Document` の最初の子は `yaml` ノードで、その `raw` は囲まれたブロック全体であり、どの `Str` にも YAML は含まれない

シナリオ：テキストが有効な Markdown の構文でないとき、テキストのまま残る

- Given: 段落 `a * b * c`
- When: テキストをパースする
- Then: 段落は `Str` だけを含み、パースは例外を投げない

シナリオ：段落にソフト改行があるとき、行は 1 つの `Str` に残る

- Given: 行末に空白のない 2 行 `first` と `second` からなる段落
- When: テキストをパースする
- Then: 段落は 1 つの `Str` を持ち、その `value` は `first\nsecond` である。ルールには、改行をまたいで続く文が見える

### 仕様が定義するとおりに Markdown を読む

書き手として、textlint には自分の文書を Markdown の仕様と同じように認識してほしい。ルールが見る構造が、レンダリングされたページで読者が見る構造と同じになるようにするためです。

**受け入れ条件：**

シナリオ：入力が CommonMark の仕様の例のとき、構造は仕様が示すものになる

- Given: `> a` の次の行が `<a>` であるような、CommonMark 0.31.2 の例
- When: テキストをパースする
- Then: AST は例の HTML と同じ構造を持つ。1 つの `BlockQuote` があり、その `Paragraph` が `a`、改行、`Html` ノード `<a>` を含む

シナリオ：入力が GFM のタスクリストの項目のとき、マーカーは項目に属する

- Given: リストの項目 `- [x] **done** task`
- When: テキストをパースする
- Then: `ListItem` は `checked: true` を持ち、その `raw` は `[x]` を含む。`Paragraph` は `**done**` から始まり、段落より下のどのノードも `[x]` を含まない

シナリオ：強調と打ち消し線が交差するとき、先に閉じた組が認識される

- Given: 段落 `*a ~~b* c~~`
- When: テキストをパースする
- Then: 段落は `*a ~~b*` の `Emphasis` と ` c~~` の `Str` を持ち、`Delete` を持たない

### レンダラーと同じように CJK のテキストの強調を認識する

VitePress や Rspress のような CJK に配慮したツールで Markdown をレンダリングする書き手として、CJK の句読点の隣にある強調を、そのツールと同じように textlint に認識してほしい。ルールが、読者が見る強調をチェックするようにするためです。
CommonMark は `**強調。**この文` の 2 つ目の `**` を閉じません。区切り文字の内側の `。` が句読点であり、外側の `こ` が句読点でも空白でもないからです。
GFM はこのテキストのアスタリスクをそのまま表示し、これらのツールは太字を表示します。

**受け入れ条件：**

シナリオ：`cjkFriendlyEmphasis` が `true` のとき、CJK の句読点の後の `**` は強い強調を閉じる

- Given: 段落 `**強調。**この文` とオプション `cjkFriendlyEmphasis: true`
- When: テキストをパースする
- Then: 段落は `**強調。**` の `Strong` と、それに続く `この文` の `Str` を持つ

シナリオ：`cjkFriendlyEmphasis` を指定しないとき、同じテキストは CommonMark に従う

- Given: オプションなしの段落 `**強調。**この文`
- When: テキストをパースする
- Then: 段落は `Str` だけを含む

シナリオ：`cjkFriendlyEmphasis` が `true` のとき、CJK の句読点の後の打ち消し線は認識される

- Given: 段落 `~~削除。~~この文` とオプション `cjkFriendlyEmphasis: true`
- When: テキストをパースする
- Then: 段落は `~~削除。~~` の `Delete` と、それに続く `この文` の `Str` を持つ

シナリオ：`cjkFriendlyEmphasis` が `true` でもテキストに CJK の文字がないとき、ノードは指定しないときと同じになる

- Given: CJK の文字と異体字セレクターを含まない文書
- When: `cjkFriendlyEmphasis: true` ありとなしで文書をパースする
- Then: 2 つの AST は、`Document` の `syntaxExtensions` を除いて同じである

### 文書がどうパースされたかを知る

強調のまわりの空白を修正するルールの作者として、文書が CJK に配慮した強調でパースされたかどうかを知りたい。修正によって、どのテキストが強調されるかが変わらないようにするためです。
ルールはプラグインのオプションを読めません。一方で、同じ `**強調。**この文` でも、この拡張を有効にすると `Strong` になり、有効にしないと `Str` のままです。
そこで、ルールが受け取る AST のルートである `Document` に、パースで有効にした拡張を記録します。

**受け入れ条件：**

シナリオ：`cjkFriendlyEmphasis` が `true` のとき、`Document` がそれを記録する

- Given: 任意の Markdown のテキストとオプション `cjkFriendlyEmphasis: true`
- When: テキストをパースする
- Then: `Document` は `syntaxExtensions` を持ち、`syntaxExtensions.cjkFriendlyEmphasis` は `true` である

シナリオ：どの拡張も有効でないとき、`Document` は `syntaxExtensions` を持たない

- Given: オプションなし、または `cjkFriendlyEmphasis: false` の任意の Markdown のテキスト
- When: テキストをパースする
- Then: `Document` は `syntaxExtensions` プロパティを持たない

シナリオ：textlint がプラグインのオプション付きで検査するとき、ルールは `Document` から拡張を読む

- Given: 設定 `"plugins": { "@textlint/markdown": { "cjkFriendlyEmphasis": true } }` と、`Document` と `Strong` を扱うルール
- When: textlint が Markdown のファイルを検査する
- Then: ルールは、どの `Strong` ノードよりも先に、`syntaxExtensions.cjkFriendlyEmphasis` が `true` である `Document` を受け取る

### 正しい位置を報告する

ルール作者として、すべてのノードが元のテキストを正確に指してほしい。エラーと修正が正しい文字に当たるようにするためです。

**受け入れ条件：**

シナリオ：どのノードも、TxtAST の位置の規約に従う

- Given: 改行が `\r\n` や `\r` のテキストを含む、任意の Markdown のテキスト
- When: テキストをパースする
- Then: すべてのノードで、`raw` は `text.slice(range[0], range[1])` に等しく、`loc` は `range` と同じ範囲を表し、子は親の内側にあり、兄弟は重ならない

シナリオ：テキストが BOM で始まるとき、位置は BOM を数えない

- Given: U+FEFF で始まるテキスト
- When: テキストをパースする
- Then: `range`、`loc`、`raw` は、BOM のないテキストの場合と同じである

シナリオ：ブロックがコンテナの中にあるとき、その範囲はコンテナのマーカーを含まない

- Given: `> a` の次の行が `> b` である引用
- When: テキストをパースする
- Then: `BlockQuote` の範囲は最初の `>` から両方の行を覆い、`Paragraph` の範囲は `a` から始まって `b` の後ろで終わる。2 行目の `>` は段落の `raw` には含まれるが、その `Str` の `value` には含まれない

### 既存のルールを動かし続ける

ルール作者として、ノードの種類と形が安定していてほしい。textlint がパーサーを更新したあとも、公開済みのルールが動き続けるようにするためです。

**受け入れ条件：**

シナリオ：一般的な Markdown を使う文書では、ノードの種類は TxtAST の汎用ノードである

- Given: 見出し、リスト、引用、コードブロック、強調、リンク、画像を含む文書
- When: テキストをパースする
- Then: ノードの種類は汎用ノードである（`Header`、`List`、`ListItem`、`BlockQuote`、`CodeBlock`、`Emphasis`、`Strong`、`Link`、`Image` など）

シナリオ：textlint をマイナーまたはパッチバージョンで更新しても、文書の AST は変わらない

- Given: Markdown の文書と、あるバージョンの textlint がその文書から作る AST
- When: 後のマイナーまたはパッチバージョンで文書をパースする
- Then: AST は同じノードの種類、プロパティ、位置を持つ。これらの変更はメジャーバージョンでだけ行い、リリースノートに載せる

### サーバーなしでパースする

組み込む開発者として、パーサーがブラウザで動いてほしい。チェックのために書き手のテキストをサーバーに送らなくて済むようにするためです。

**受け入れ条件：**

シナリオ：パーサーをブラウザ向けにバンドルするとき、Node.js の polyfill を必要としない

- Given: `@textlint/markdown-to-ast` とその実行時の依存を、各パッケージの `browser` 条件で解決したもの
- When: ブラウザ向けにバンドルする
- Then: バンドルは `node:fs` や `node:util` のような Node.js の組み込みモジュールを必要とせず、`parse` は Node.js と同じ AST を返す

### 信頼できない投稿者の文書をチェックする

CI で textlint を実行する書き手として、細工された文書も大きさに比例した時間でパースしてほしい。プルリクエストによってチェックが止まらないようにするためです。

**受け入れ条件：**

シナリオ：文書が閉じない構文を繰り返すとき、パースの時間は大きさに比例して増える

- Given: `[a](b (`、`<!--`、バッククォートの並びのような開始部分を、閉じる部分なしで繰り返す文書
- When: 文書を 4 倍の長さにしてパースする
- Then: パースにかかる時間は約 4 倍であり、16 倍ではない

シナリオ：文書が上限より深く入れ子になるとき、上限を超えたマーカーはテキストのまま残る

- Given: 200 個の `>` マーカーのあとにテキストが続く行
- When: テキストをパースする
- Then: `parse` は例外を投げずに AST を返す。AST は 100 個の入れ子の `BlockQuote` ノードを持ち、残りの `>` マーカーはいちばん内側の段落の `Str` に入る

## KPI

### 仕様への適合

- **目標値：** CommonMark 0.31.2 と GFM の拡張のすべての例が、その HTML が示す構造にパースされること。
- **測定方法：** 両方の仕様の例をパースし、AST の構造を期待される出力と比べる。
- **測定時期：** パーサーを変えるとき、および仕様の新しいバージョンを採用するとき。

### CJK に配慮した強調への適合

- **目標値：** `cjkFriendlyEmphasis` があるとき、[実装者向けのヒント](https://github.com/tats-u/markdown-cjk-friendly/blob/main/implementers-tips.md) にある開始と終了の条件の表のすべての行と、仕様のすべての例が、仕様のリファレンス実装と同じ強調、強い強調、打ち消し線になること。
- **測定方法：** それぞれの入力をオプション付きでパースし、`Emphasis`、`Strong`、`Delete` を、同じ入力に対してリファレンス実装が出す HTML と比べる。
- **測定時期：** インラインフェーズを変えるとき、および仕様の新しい版を採用するとき。

### パースの速度

- **目標値：** 同じコーパスで前のリリースより遅くならないこと。速いほうが望ましい。
- **測定方法：** 実際の文書からなるコーパスをループしてパースし、前のリリースと変更後の中央値を比べる。
- **測定時期：** パーサーの実装を変えるとき。

### 依存

- **目標値：** 本番依存の閉包には、パースに必要なパッケージだけがあること。Markdown の書き出しのように、パース以外の処理に使うパッケージは必要ない。
- **測定方法：** `pnpm-lock.yaml` から本番依存の閉包を数える。
- **測定時期：** パッケージの依存を変えるとき。

## 機能要件

### Markdown を TxtAST にパースする

**概要：** `parse(text, options)` はテキスト全体を含む `Document` ノードを返す。

**入力：** BOM で始まってもよい Markdown の文字列と、省略できるオプション。オプションは [拡張](#拡張) に載せる。

**出力：** [TxtAST](../txtast/requirements.ja.md) に従う `Document` ノード。

#### 適用条件

##### 仕様

パーサーは次の仕様に、この順で従う。

1. [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/) が、それが定義するすべてを決める。
2. [GitHub Flavored Markdown 0.29-gfm](https://github.github.com/gfm/) が、それが定義する拡張を決める。[表](https://github.github.com/gfm/#tables-extension-)、[タスクリストの項目](https://github.github.com/gfm/#task-list-items-extension-)、[打ち消し線](https://github.github.com/gfm/#strikethrough-extension-)、[自動リンク](https://github.github.com/gfm/#autolinks-extension-) である。
3. `cjkFriendlyEmphasis` が `true` のとき、[CommonMark CJK-friendly Amendments](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md) が、区切り文字の並びが開けるか閉じられるかを決める。[拡張](#拡張) に書いたとおりである。
4. この文書が、これらの仕様のどれも定義しないものを決める。AST 自体、ノードの位置、フロントマター、脚注、インラインの注である。

仕様が定義するのは、テキストの認識のしかたと HTML へのレンダリングであり、AST ではない。
そのため、AST は仕様の HTML と同じ構造を持ち、この文書はノードの種類、プロパティ、範囲だけを決める。
仕様が決めていない場合は、この文書が挙動を書く。

GFM の [許可されない生の HTML の拡張](https://github.github.com/gfm/#disallowed-raw-html-extension-) は HTML の出力だけを変えるので、適用しない。

##### 改行と文字

- 行は `\n`、`\r\n`、`\r` で終わる（[line ending](https://spec.commonmark.org/0.31.2/#line-ending)）。`loc` は、[TxtAST](../txtast/requirements.md) の Requirements が定めるとおり、これらの改行で行を数える。
- テキストの先頭の BOM は、パースの前に取り除く。オフセットは BOM を数えず、`Document` の `raw` は BOM を含まない。
- U+0000 は、`value` とほかのプロパティでは U+FFFD に置き換える（[insecure characters](https://spec.commonmark.org/0.31.2/#insecure-characters)）。`raw` は元の文字を保つ。
- タブは置き換えない。`raw` と `value` にタブのまま残る（[tabs](https://spec.commonmark.org/0.31.2/#tabs)）。

##### テキストの値

- `Str` の `value` では、バックスラッシュのエスケープと文字参照をデコードする（[backslash escapes](https://spec.commonmark.org/0.31.2/#backslash-escapes)、[character references](https://spec.commonmark.org/0.31.2/#entity-and-numeric-character-references)）。`raw` は書かれたとおりに保つ。
- [ソフト改行](https://spec.commonmark.org/0.31.2/#soft-line-breaks) はノードにならない。`Str` に残り、その `value` は書かれたとおりの改行を持つ。改行の前の空白と、次の行のインデントとコンテナのマーカーは、`value` に含まれない。
- `url`、`title`、`alt`、`lang`、`meta` も同じようにデコードする。複数行にまたがる `title` は、改行の前の空白を保つ。

### ブロック

**概要：** CommonMark と GFM の各ブロックの構造は、1 つのノードになる。

**入力：** テキストの中のブロックの構造。

**出力：** 次の表のノード。

#### 適用条件

##### リーフブロック

| 構文 | ノード | プロパティ | 範囲 |
| --- | --- | --- | --- |
| [区切り線](https://spec.commonmark.org/0.31.2/#thematic-breaks) | `HorizontalRule` | | 最初のマーカーの文字から行末まで |
| [ATX 見出し](https://spec.commonmark.org/0.31.2/#atx-headings) | `Header` | `depth`: `#` の数 | 最初の `#` から行末まで |
| [Setext 見出し](https://spec.commonmark.org/0.31.2/#setext-headings) | `Header` | `depth`: `=` は 1、`-` は 2 | 内容から下線の行の行末まで |
| [インデントコードブロック](https://spec.commonmark.org/0.31.2/#indented-code-blocks) | `CodeBlock` | `value`: インデントを除いたコード。`lang` と `meta` は `null` | 最初の行のインデントから最後の行の行末まで |
| [フェンスコードブロック](https://spec.commonmark.org/0.31.2/#fenced-code-blocks) | `CodeBlock` | `value`: フェンスの間のコード。`lang`: info string の最初の単語、または `null`。`meta`: info string の残り、または `null` | 開始のフェンスから終了のフェンスの行の行末まで |
| [HTML ブロック](https://spec.commonmark.org/0.31.2/#html-blocks) | `Html` | `value`: 書かれたとおりのブロックの行 | インデントを含む最初の行の行頭から、最後の行の行末まで |
| [リンク参照定義](https://spec.commonmark.org/0.31.2/#link-reference-definitions) | `Definition` | `identifier`、`label`、`url`、そして `title` または `null` | `[` から最後の行の行末まで |
| [段落](https://spec.commonmark.org/0.31.2/#paragraphs) | `Paragraph` | | 内容の最初の文字から最後の行の行末まで |
| [表](https://github.github.com/gfm/#tables-extension-) | `Table` | `align`: 列ごとに `"left"`、`"right"`、`"center"`、`null` のいずれか | 見出し行から最後の行の行末まで |

コメント `<!-- … -->` は HTML ブロックまたは生の HTML なので、`Html` になる。パーサーは `Comment` を作らない。

リーフブロックの範囲は、インデントコードブロックと HTML ブロックを除き、最初の行の前のインデントを含まない。
範囲は最後の行の行末で終わるので、その行の末尾の空白は範囲に含まれ、改行は含まれない。

空行はノードにならない。

##### 表

- `Table` の子は `TableRow` ノードであり、見出し行と本体の行である。区切り行はノードにならない。
- `TableRow` の子は `TableCell` ノードである。セルの範囲は先頭の `|` を含み、最後のセルは末尾の `|` も含む。
- `TableCell` の子はインラインのノードであり、内容の前後の空白を含まない。
- 複数行の段落のあとに区切り行が続くとき、段落の最後の行が見出し行になり、その前の行は段落のまま残る。GFM の仕様はこの場合を書いていない。

##### コンテナブロック

| 構文 | ノード | プロパティ | 範囲 |
| --- | --- | --- | --- |
| [引用](https://spec.commonmark.org/0.31.2/#block-quotes) | `BlockQuote` | | 最初の `>` から最後の子の終わりまで |
| [リスト](https://spec.commonmark.org/0.31.2/#lists) | `List` | `ordered`。`start`: 最初の項目の番号、箇条書きでは `null`。`spread` | 最初の項目のマーカーから最後の項目の終わりまで |
| [リストの項目](https://spec.commonmark.org/0.31.2/#list-items) | `ListItem` | `spread`。`checked`: `true`、`false`、`null` のいずれか | リストのマーカーから最後の子の終わりまで |

- 子のブロックの範囲は、最初の行の前にあるコンテナのマーカーとインデントを含まない。2 行目以降の行頭にあるマーカーは範囲の内側にある。
- `ListItem` の `spread` は、直接の子が空行で区切られているとき `true` である。`List` の `spread` は、項目が空行で区切られているとき `true` である。
- 空のリストの項目と、番号が 1 でない順序付きリストの項目は、段落を中断しない。ほかのブロックのあとでは、リストを始める。
- 1 行に単独である完結した HTML タグ（HTML ブロックの開始条件 7）は、段落を中断しない。引用やリストの項目の、マーカーを省いた継続行でも同じである。

##### タスクリストの項目

[タスクリストの項目](https://github.github.com/gfm/#task-list-items-extension-) は、最初の段落が `[ ]`、`[x]`、`[X]` のいずれかと、それに続く空白で始まる `ListItem` である。

- `checked` は、`[ ]` では `false` であり、`[x]` と `[X]` では `true` である。
- マーカーは `ListItem` に属する。つまり、`ListItem` の `raw` に含まれる。
- `Paragraph` は、最初のインラインのノードが何であっても、マーカーとそれに続く空白のあとの最初の文字から始まる。
- どのインラインのノードもマーカーを含まない。

### インライン

**概要：** CommonMark と GFM の各インラインの構造は 1 つのノードになり、残りのテキストは `Str` になる。

**入力：** 段落、見出し、表のセルの内容。

**出力：** 次の表のノード。元のテキストの順に並ぶ。

#### 適用条件

##### インラインのノード

| 構文 | ノード | プロパティ | 範囲 |
| --- | --- | --- | --- |
| [テキスト](https://spec.commonmark.org/0.31.2/#textual-content) | `Str` | `value`: デコードしたテキスト | 書かれたとおりのテキスト |
| [コードスパン](https://spec.commonmark.org/0.31.2/#code-spans) | `Code` | `value`: 書かれたとおりのコード。両側に空白があるときは、それぞれから空白を 1 つ除く | 開始のバッククォートから終了のバッククォートまで |
| [強調](https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis) | `Emphasis` | | 開始の区切り文字から終了の区切り文字まで |
| [強い強調](https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis) | `Strong` | | 開始の区切り文字から終了の区切り文字まで |
| [打ち消し線](https://github.github.com/gfm/#strikethrough-extension-) | `Delete` | | 開始の `~` または `~~` から終了のものまで |
| [インラインリンク](https://spec.commonmark.org/0.31.2/#links) | `Link` | `url`、そして `title` または `null` | `[` から `)` まで |
| 定義のある [参照リンク](https://spec.commonmark.org/0.31.2/#links) | `LinkReference` | `identifier`、`label`、`referenceType` | `[` から最後の `]` まで |
| [インライン画像](https://spec.commonmark.org/0.31.2/#images) | `Image` | `url`、`alt`、そして `title` または `null` | `!` から `)` まで |
| 定義のある [参照画像](https://spec.commonmark.org/0.31.2/#images) | `ImageReference` | `identifier`、`label`、`referenceType`、`alt` | `!` から最後の `]` まで |
| [自動リンク](https://spec.commonmark.org/0.31.2/#autolinks) | `Link` | `url`: URI、または `mailto:` とアドレス。`title` は `null` | `<` から `>` まで。子の `Str` はその間のテキスト |
| [自動リンクのリテラル](https://github.github.com/gfm/#autolinks-extension-) | `Link` | `url`: 書かれたとおりの URL。`www.` には `http://` を、メールアドレスには `mailto:` を付ける。`title` は `null` | URL またはアドレス。子の `Str` は同じ範囲を持つ |
| [生の HTML](https://spec.commonmark.org/0.31.2/#raw-html) | `Html` | `value`: タグ | `<` から `>` まで |
| [強制改行](https://spec.commonmark.org/0.31.2/#hard-line-breaks) | `Break` | | 空白またはバックスラッシュと、改行 |

##### 参照

- 対応する定義のない参照リンクと参照画像は、ノードにならない。その角括弧は `Str` に残る。
- `referenceType` は、`[text][label]` では `"full"`、`[label][]` では `"collapsed"`、`[label]` では `"shortcut"` である。
- `Image` と `ImageReference` は子を持たない。`alt` は説明のプレーンテキストである。

##### 強調と打ち消し線

- `*`、`_`、`~` の区切り文字は、元のテキストの順にまとめて対応させる。閉じる区切り文字はそれぞれ、対応できるいちばん近い開く区切り文字を取る。
- 対応した組は、その間にある区切り文字をただのテキストにするので、組は交差しない。`*a ~~b* c~~` は、`Emphasis` とそれに続くテキストである。
- `~` は `~` とだけ、`~~` は `~~` とだけ対応する。3 つ以上の `~` の並びはテキストである。
- `*` や `_` の並びが開けるか閉じられるかは CommonMark に従う。`~` の並びは、`*` の並びと同じく、left-flanking のときに開けて、right-flanking のときに閉じられる。CJK に配慮した強調を有効にすると、この判断が変わる。

##### 生の HTML と自動リンク

- タグの中の空白は、スペース、タブ、改行である。ほかの Unicode の空白は属性を区切らないので、そのようなテキストは `Str` のまま残る。
- `<` と `>` の間の自動リンクは、スペース、`<`、`>`、ASCII の制御文字でだけ終わる。

### 拡張

**概要：** 拡張は構文の認識のしかたを変え、そのオプションが `true` のときだけ有効になる。このパーサーが持つ拡張は、CJK に配慮した強調だけである。

**入力：** `parse` のオプション。`@textlint/textlint-plugin-markdown` は同じオプションを受け取り、`parse` に渡す。

**出力：** 拡張による AST と、`Document` の `syntaxExtensions` プロパティ。

#### 適用条件

##### オプション

| オプション | 値 | 既定値 | 拡張 |
| --- | --- | --- | --- |
| `cjkFriendlyEmphasis` | `boolean` | `false` | CJK に配慮した強調 |

- 拡張は、そのオプションが `true` のときだけ有効になる。ほかの値のときや、値がないときは無効である。
- プラグインは、`"plugins": { "@textlint/markdown": { "cjkFriendlyEmphasis": true } }` のように、設定のプラグインのオプションでオプションを受け取る。
- VitePress と Rspress は同じ拡張に `cjkFriendlyEmphasis` という名前を使うので、書き手は textlint とレンダラーで同じ名前を設定できる。

##### CJK に配慮した強調

- [CommonMark CJK-friendly Amendments](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md) が、CommonMark の left-flanking と right-flanking の区切り文字の並びの定義と、`_` と `__` が強調を開ける条件を置き換える。
- `~` と `~~` にも、`*` と同じく、置き換えた left-flanking と right-flanking の定義を使う。仕様は CommonMark に対して書かれているが、仕様の作者による打ち消し線の実装も同じように変えている。
- CJK の文字、CJK の句読点、異体字セレクターの範囲は、仕様が対象とする Unicode のバージョンで仕様が定義するとおりである。
- 区切り文字の並びの隣の文字はコードポイントであり、サロゲートペアは 1 文字である。
- 変わるのは、区切り文字の並びが開けるか閉じられるかだけである。元のテキストの順での対応、3 の倍数の規則、入れ子の上限、`Emphasis`、`Strong`、`Delete` のノードの種類、プロパティ、範囲は [インライン](#インライン) のとおりである。
- ほかの構文は変わらない。

##### `Document` の `syntaxExtensions`

形式をまたいだ `syntaxExtensions` の意味は [TxtAST](../txtast/requirements.ja.md#文書の拡張) が定義する。このパーサーは次のように設定する。

- 少なくとも 1 つの拡張が有効なとき、`Document` は `syntaxExtensions` を持つ。これは有効なオプションの名前をキーとし、それぞれの値を `true` とするオブジェクトである。`cjkFriendlyEmphasis` では `{ "cjkFriendlyEmphasis": true }` になる。
- 無効な拡張はキーにならない。
- どの拡張も有効でないとき、`Document` は `syntaxExtensions` を持たない。そのため、オプションなしの AST は、この文書のほかの部分が定義するものである。

#### 例外的な挙動

##### 知らないオプション

この文書が載せていないオプションは無視する。それは `syntaxExtensions` のキーにならず、`parse` は例外を投げない。

##### 仕様が決めていない文字

区切り文字の並びが孤立したサロゲートの隣にあるとき、または空白か漢字の異体字セレクターに続く異体字セレクターの後にあるときの結果を、仕様は決めていない。
これらの場合、並びの隣の文字は、空白でも句読点でも CJK の文字でもないものとする。

### textlint が定義する構文

**概要：** フロントマター、脚注、インラインの注は、CommonMark にも GFM にも含まれない。textlint がここで定義し、そのノードは小文字で始まる名前の拡張ノードである。

**入力：** テキストの先頭のフロントマター、またはテキストの中の脚注の構文。

**出力：** 次の拡張ノード。

#### 適用条件

##### フロントマター

フロントマターは、テキストの最初の行でだけ認識する。

| 構文 | ノード | プロパティ | 範囲 |
| --- | --- | --- | --- |
| `---` と `---` の間の行 | `yaml` | `value`: フェンスの間の行 | 開始のフェンスから終了のフェンスの終わりまで |
| `+++` と `+++` の間の行 | `toml` | `value`: フェンスの間の行 | 開始のフェンスから終了のフェンスの終わりまで |
| `;;;` と `;;;` の間、または `---json` と `---` の間の行 | `json` | `value`: フェンスの間の行 | 開始のフェンスから終了のフェンスの終わりまで |
| 最初の行の `{` から `}` の行までの行 | `json` | `value`: 波括弧の間の行 | `{` から `}` まで |

`value` は書かれたとおりのテキストである。パーサーは YAML、TOML、JSON をパースしない。

##### 脚注

| 構文 | ノード | プロパティ | 範囲 |
| --- | --- | --- | --- |
| 行頭の `[^label]: text` | `footnoteDefinition` | `identifier`、`label`。子はブロック | `[` から最後の子の終わりまで |
| 対応する定義のある `[^label]` | `footnoteReference` | `identifier`、`label` | `[` から `]` まで |
| `^[text]` | `footnote` | 子はインラインのノード | `^` から `]` まで |

- ラベルは空白を含んでよい。`identifier` は、リンク参照と同じく、`label` を正規化したものである。
- `[^label]:` のあとでは、空白の文字を 1 つ読み飛ばす。4 つのスペースでインデントした行は、定義を続ける。
- `[^` は、リンクもリンク参照定義も始めない。
- 対応する定義のない `[^label]` は `Str` に残る。
- インラインの注の中では、`]` はリンクを閉じないとき、いちばん近い開いている注を閉じる。

#### 例外的な挙動

##### 閉じていないフロントマター

フロントマターのフェンスが閉じていないとき、フロントマターのノードはなく、テキストは最初の行から通常の Markdown としてパースする。
失敗したフェンスは、残りのテキストの認識のしかたに影響しない。

##### 最初の行にないフロントマター

最初の行より後ろのフェンスは、通常の Markdown である。たとえば `---` は、区切り線または Setext 見出しの下線である。

### 上限

**概要：** パーサーは AST の深さに上限を設ける。どんな入力でも、パースとたどる処理を安全にするためである。

**入力：** コンテナまたはインラインの構造を入れ子にするテキスト。

**出力：** 深さに上限のある AST。

#### 適用条件

- コンテナブロックは、`Document` の下に 100 段まで入れ子になる。`BlockQuote` と `footnoteDefinition` はそれぞれ 1 段を使い、リストの項目は 2 段（`List` と `ListItem`）を使う。
- インラインのノードは、段落、見出し、表のセルの中で 100 段まで入れ子になる。`Emphasis`、`Strong`、`Delete`、`Link`、`LinkReference`、`footnote` がそれぞれ 1 段を使う。
- 上限は、実際の文書が届かない深さである。

#### 例外的な挙動

##### 不正な Markdown

Markdown に構文エラーはない。閉じていない構文や無効な構文は、CommonMark に従ってテキストになり、`parse` は例外を投げない。

##### 上限を超える入れ子

上限を超えてコンテナを開くことになるマーカーは、現在のブロックのテキストとして扱う。
インラインのノードを上限より深くすることになる区切り文字や角括弧の組は対応させず、そのマーカーは `Str` に残る。
`parse` は例外を投げず、上限の内側の構造は保たれる。

## データ要件

### 必要なデータ

- **ソーステキスト：** `parse` に渡された Markdown の文字列。`parse` が返った後は保持しない。
- **オプション：** `parse` に渡されたオプション。`Document` の `syntaxExtensions` が、有効にした拡張を記録する。

### 関係

`Document` を除く各ノードは、ちょうど 1 つの親を持つ。ノードの子は元のテキストの順に並ぶ。

### 個人情報

なし。パーサーはデータを集めず、保持しない。

## 外部サービスへの依存

なし。パースはローカルで動き、ネットワークのサービスを使わない。

## セキュリティの考慮事項

textlint は CI で、信頼できない投稿者の文書に対して実行される。そのため、細工された文書や特殊な文書がパースを止めてはならない。
パースの時間は、入力の大きさにほぼ比例していなければならない。長い表、多数の閉じていない角括弧、閉じない開始部分の繰り返し、深く入れ子になったリストでも同じである。
ブロックやインラインの区切り文字がどれだけ深く入れ子になっても、パースはコールスタックをあふれさせてはならない。`parse` は `RangeError: Maximum call stack size exceeded` を投げずに AST を返す。
`parse` が返す AST は、上の上限によって深さが抑えられているので、textlint とルールは再帰でたどることができる。
`parse` の呼び出しはそれぞれ独立している。結果は前にパースした文書に依存せず、ある呼び出しの失敗は後の呼び出しに影響しない。

## 未解決事項

- **パースの速度の数値目標：** 目標は前のリリースとの比較で、MB/s のような絶対値はない。絶対値が決まるまでは、コーパスで遅くならない変更を受け入れる。利用者から、自分の文書でパースが遅すぎると報告があったときに見直す。azu が決める。
- **CJK に配慮した仕様の版：** CommonMark CJK-friendly Amendments にはバージョン番号がない。番号ができるまでは、文字の範囲が Unicode 18 のものである版に従う。仕様が定義や Unicode のバージョンを変えたときに見直す。azu が決める。
- **複数行の段落から取る表の見出し行：** `<a>` だけの行のように、単独では別のブロックを始める行が段落の最後の行であるとき、その行が見出し行になれるかどうかを、GFM の仕様は書いていない。GitHub の実装で確認できるまでは、「表」に書いたとおり、最後の行を見出し行とする。この入力に対する cmark-gfm の結果がわかったときに見直す。azu が決める。
- **コンテナの終わりにあるブロックの終わり：** 閉じていないフェンスコードブロックや、コンテナのマーカーまたは空白だけの末尾の行について、ノードがどこで終わるかは、どちらの仕様も定義していない。決まりができるまでは、テストフィクスチャで固定した終了位置を使う。ルール作者から、修正にとって誤った位置の報告があったときに見直す。azu が決める。
