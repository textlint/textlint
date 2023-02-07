---
author: azu
description: "この書籍はJavaScriptの入門書として書かれています。この書籍の目的、目的外としたこと、読者対象、書籍としての特徴について紹介します。"
---

# はじめに {#prolog}

## 本書の目的 {#do}

この書籍の目的は、JavaScriptというプログラミング言語を学ぶことです。
先頭から順番に読んでいけば、JavaScriptの文法や機能を一から学べるように書かれています。

JavaScriptの文法といった書き方を学ぶことも重要ですが、実際にどう使われているかを知ることも目的にしています。
なぜなら、JavaScriptのコードを読んだり書いたりするには、文法の知識だけでは足りないと考えているためです。
そのため、[第一部:基本文法][]では文法だけではなく現実の利用方法について言及し、[第二部:ユースケース][]では小さなアプリケーションを例に現実と近い使い方を解説しています。

また、JavaScriptは常に変化を取り入れている言語でもあり、言語自身や言語を取り巻く開発環境も変化しています。
この書籍では、これらのJavaScriptを取り巻く変化に対応できる基礎を身につけていくことを目的としています。
そのため、単に書き方を学ぶのではなく、なぜ動かないのかや問題の調べ方にも焦点を当てていきます。

## 本書の目的ではないこと {#do-not}

ひとつの書籍でJavaScriptのすべてを学ぶことはできません。
なぜなら、JavaScriptを使ってできる範囲があまりにも広いためです。
そのため、この書籍では取り扱わない内容（目的外）を明確にしておきます。

- 他のプログラミング言語と比較するのが目的ではない
- ウェブブラウザについて学ぶのが目的ではない
- Node.jsについて学ぶのが目的ではない
- JavaScriptのすべての文法や機能を網羅するのが目的ではない
- JavaScriptのリファレンスとなることが目的ではない
- JavaScriptのライブラリやフレームワークの使い方を学ぶのが目的ではない
- これを読んだから何か作れるというゴールがあるわけではない

この書籍は、リファレンスのようにすべての文法や機能を網羅していくことを目的にはしていません。
JavaScriptやブラウザのAPIに関しては、[MDN Web Docs][]（MDN）というすばらしいリファレンスがすでにあります。

ライブラリの使い方や特定のアプリケーションの作り方を学ぶことも目的ではありません。
それらについては、ライブラリのドキュメントや実在するアプリケーションから学ぶことを推奨しています。
もちろん、ライブラリやアプリケーションについての別の書籍をあわせて読むのもよいでしょう。

この書籍は、それらのライブラリやアプリケーションが動くために利用している仕組みを理解する手助けをします。
作り込まれたライブラリやアプリケーションは、一見するとまるで魔法のようにも見えます。
実際には、何らかの仕組みがありその上で作られたものがライブラリやアプリケーションとして動いています。

具体的な仕組み自体までは解説しませんが、そこに仕組みがあることに気づき理解する手助けをします。

## 本書を誰が読むべきか {#who-read}

この書籍は、プログラミング経験のある人がJavaScriptという言語を新たに学ぶことを念頭に書かれています。
そのため、この書籍で初めてプログラミング言語を学ぶという人には、少し難しい部分があります。
しかし、実際にプログラムを動かして学べるように書かれているため、プログラミング初心者が挑戦してみてもよいでしょう。

JavaScriptを書いたことはあるが最近のJavaScriptがよくわからないという人も、この書籍の読者対象です。
2015年に、JavaScriptにはECMAScript 2015と呼ばれる仕様の大きな変更が入りました。
この書籍は、ECMAScript 2015を前提としたJavaScriptの入門書であり、必要な部分では今までの書き方との違いについても触れています。
そのため、新しい書き方や何が今までと違うのかわからない場合にも、この書籍は役に立ちます。

この書籍は、JavaScriptの仕様に対して真剣に向き合って書かれています。
入門書であるからといって、極端に省略して不正確な内容を紹介することは避けています。
そのため、JavaScriptの熟練者であっても、この書籍を読むことで発見があるはずです。

## 本書の特徴 {#features}

この書籍の特徴について簡単に紹介します。

ECMAScript 2015と呼ばれる仕様の大きな更新が行われた際に、JavaScriptには新しい書き方や機能が大きく増えました。
今までのJavaScriptという言語とは異なるものに見えるほどです。

この書籍は、新しくなったECMAScript 2015以降を前提にして一から書かれています。
今からJavaScriptを学ぶなら、新しくなったECMAScript 2015を前提としたほうがよりスッキリと学べるためです。
この書籍は、ECMAScript 2015をベースにしつつ現時点の最新バージョンであるECMAScript {{book.esversion}}まで対応しています。

また、現在のウェブブラウザは、ECMAScript 2015をサポートしています。
そのため、この書籍では一から学ぶ上で知る必要がない古い書き方は紹介していないことがあります。
しかし、既存のコードを読む際には古い書き方への理解も必要になるので、頻出するケースについては紹介しています。

一方で、近い未来に入るであろうJavaScriptの新しい機能については触れていません。
なぜなら、それは未来の話であるため不確定な部分が多く、実際の使われ方も予測できないためです。
この書籍は、基本を学びつつ現実のユースケースから離れすぎないことを目的としています。

この書籍の文章やソースコードは、オープンソースとしてGitHubの[asciidwango/js-primer][]で公開されています。
また書籍の内容が[jsprimer.net][]というURLで公開されているため、ウェブブラウザで読めます。
ウェブ版では、その場でサンプルコードを実行してJavaScriptを学べます。

書籍の内容がウェブで公開されているため、書籍の内容を共有したいときにURLを貼れます。
また、書籍の内容やサンプルコードは次のライセンスの範囲内で自由に利用できます。

## ライセンス {#license}

この書籍に記述されているすべてのソースコードは、MITライセンスに基づいたオープンソースソフトウェアとして提供されます。
また、この書籍の文章はCreative CommonsのAttribution-NonCommercial 4.0（CC BY-NC 4.0）ライセンスに基づいて提供されます。
どちらも、著作権表示がされていればある程度自由に利用できるライセンスとなっています。

ライセンスについての詳細は[ライセンスファイル][]を参照してください。

## 書籍版について {#print-version}

この書籍は[アスキードワンゴ](https://asciidwango.jp/)から書籍として出版されています。
書籍版は、次のページから購入できます。

- [JavaScript Primer 迷わないための入門書 | azu, Suguru Inatomi |本 | 通販 | Amazon](https://www.amazon.co.jp/dp/4048930737/)
- [JavaScript Primer 迷わないための入門書【委託】 - 達人出版会](https://tatsu-zine.com/books/javascript-primer)

## ウェブ版と書籍版の違い {#diff-with-print-version}

書籍版の内容は[JavaScript Primer v1.0.0](https://github.com/asciidwango/js-primer/releases/tag/1.0.0)と同じです。

ウェブ版と書籍版は次の点が異なります。

- ウェブ版と書籍版はレイアウトが異なる
- 書籍版には索引が追加されている
- ウェブ版は最新の仕様への追従など日々少しずつ継続的に更新され続けている

書籍版の内容はウェブ版と同じですが、本として読めるように内容とレイアウトが最適化されています。
書籍版は出版時点では基本的な内容は同じですが、ウェブ版は常にアップデートされています。

この書籍は先頭から順番に読んでいくように書かれています。
そのため、読み物としては書籍版の方が読みやすくなっています。
ウェブ版では検索機能やサンプルコードを実行できる機能が組み込まれているため、必要に応じて併用してください。

## 書籍への支援について {#sponsors}

JavaScript PrimerはECMAScriptのアップデートに追従したり、現実の使い方を反映するために、継続してアップデートしています。
継続的にアップデートするために、書籍への支援はいつでも歓迎しています。

GitHub Sponsorsで著者を支援できます。

- [Sponsor @azu on GitHub Sponsors](https://github.com/sponsors/azu)

また、書籍版へのレビューを書くことも支援に繋がります。

- [JavaScript Primer 迷わないための入門書 | azu, Suguru Inatomi |本 | 通販 | Amazon](https://www.amazon.co.jp/dp/4048930737/)

GitHubのDiscussions（掲示板）の他の人の質問に答えたり、JSPrimerを読んだ感想を書くことも支援になります。

- [Discussions](https://github.com/asciidwango/js-primer/discussions)

Discussionsのガイドラインは次のスレッドにまとめられています。

- [👋 ようこそ JavaScript Primer へ ! · Discussion #1304](https://github.com/asciidwango/js-primer/discussions/1304)

書籍に対してIssueを立てたり、Pull Requestを送ったりして直接的に支援もできます。
IssueやPull Requestについては、次のページを参照してください。

- [文章の間違いに気づいたら · JavaScript Primer #jsprimer](https://jsprimer.net/intro/feedback/)

## 謝辞 {#thanks}

この書籍は次の方々にレビューをしていただきました。

<!-- textlint-disable -->

- mizchi（竹馬光太郎）
- 中西優介@better_than_i_w
- @tsin1rou
- sakito
- 川上和義
- 尾上洋介

<!-- textlint-enable -->

この書籍をよりよいものにできたのは皆さんのご協力のおかげです。

また、この書籍は最初からGitHubに公開した状態で執筆が行われています。
そのため、Issueで問題の報告やPull Requestで修正を送ってもらうなど、さまざまな人の助けによって成り立っています。
この書籍に対してコントリビュートしてくれた方々に感謝します。

## 変更点 {#changelog}

{% if output.name == "ebook" %}
<!-- 書籍向け -->

初版からの変更点をまとめると次のようになります。

<!-- textlint-disable no-use-prototype-hash -->

- ECMAScriptの新しいバージョンであるES2020、ES2021、ES2022に対応した
- 新しいECMAScriptの機能によって、使う必要がなくなった機能は非推奨へと変更した
- 文字では想像しにくいビット演算、非同期処理などに図を追加した
- PromiseとAsync Functionを非同期の処理の中心として書き直した
- 一方で、エラーファーストコールバックは非同期処理としてはメインではなくなった
- `Array#includes`という表記は、Private Classs Fields(`#field`)と記号が被るため廃止した
- Node.jsでもECMAScript Modulesを使うようになり、CommonJSはメインではなくなった
- Node.jsが12から18までアップデートし、npmは6から9までアップデート、各種ライブラリも最新にアップデート
- 読者からのフィードバックを受けて、全体をより分かりやすく読みやすくなるように書き直した

<!-- textlint-enable no-use-prototype-hash -->

ECMAScriptはアップデートにより、機能的が利用できなくなるという変更はほぼありません。
その点では、初版で紹介したJavaScriptは現在でも動作します。

一方で、実際の利用のされ方などの状況を見て、使われなくなっていく機能はあります。
そのため、この書籍では古くなった機能は、何によって置き換えられたのかも解説しています。

{% endif %}
{% if output.name == "website" %}
<!-- ウェブ向け -->

ウェブ版は、常に最新のECMAScriptに対応するように更新しています。
それぞれ新しいECMAScriptバージョンへ対応するときに、変更点をまとめたリリースノートを作成しています。

- [v1.0.0: 初版のリリース](https://github.com/asciidwango/js-primer/releases/tag/1.0.0)
- [v2.0.0: ECMAScript 2020対応](https://github.com/asciidwango/js-primer/releases/tag/v2.0.0)
- [v3.0.0: ECMAScript 2021対応](https://github.com/asciidwango/js-primer/releases/tag/v3.0.0)
- [v4.0.0: ECMAScript 2022対応](https://github.com/asciidwango/js-primer/releases/tag/v4.0.0)

新しいバージョンが公開されたときに通知を受け取りたい方は、[GitHubリポジトリ](https://github.com/asciidwango/js-primer)を[Watch](https://github.com/asciidwango/js-primer/watchers)してください。

[![Watch button](../landing/img/repo-actions-watch.png)](https://github.com/asciidwango/js-primer/watchers)

また、次のフォームからメールアドレスを登録しておくと更新情報をメールで受け取れます。

<style>
.mail-form {
  padding: 8px
}
.form-group {
  margin-bottom: 0.5em;
}
.form-label {
  display: inline-block;
  max-width: 100%;
  margin-bottom: 5px;
  font-weight: 700;
}
.form-control {
    box-shadow: none;
    display: block;
    width: 100%;
    height: 34px;
    padding: 6px 12px;
    font-size: 14px;
    line-height: 1.42857143;
    color: #555;
    background-color: #fff;
    background-image: none;
    border: 1px solid #ccc;
    border-radius: 4px;
}
.btn-d {
  color: #fff;
  background-color: rgba(51,51,51,.8);
}
.btn {
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;
}
.btn-block {
  display: block;
  width: 100%;
}
</style>

<form action="https://github.us13.list-manage.com/subscribe/post?u=fc41e11a2b9dc6f05350e0de0&amp;id=7ab1594ae8"
      method="post" id="js_mail_form" novalidate class="mail-form" target="_blank">
    <div class="form-group"><label for="email" class="form-label">メールアドレス</label><input id="email" class="form-control"
                                                                      name="EMAIL" type="email" required/>
    </div>
    <button class="btn btn-d btn-lg btn-block" type="submit">登録</button>
</form>

- [更新通知を受け取るメールアドレスを登録するフォーム](https://us13.list-manage.com/subscribe?u=fc41e11a2b9dc6f05350e0de0&id=7ab1594ae8)

{% endif %}


[asciidwango/js-primer]: https://github.com/asciidwango/js-primer
[jsprimer.net]: https://jsprimer.net/
[mdn web docs]: https://developer.mozilla.org/ja/
[ライセンスファイル]: https://github.com/asciidwango/js-primer/blob/master/LICENSE
[第一部:基本文法]: ../basic/README.md
[第二部:ユースケース]: ../use-case/README.md
