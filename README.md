# X (Twitter) ブックマークエクスポーター

X (旧Twitter) のブックマークを、すべてCSVファイルとしてエクスポートするためのUserScriptです。

This is a UserScript to export all your X (formerly Twitter) bookmarks to a single CSV file.

***

## 主な機能 (Features)

* **ワンクリックで全件エクスポート**: ボタンを押すだけで、ブックマークを最後まで自動で収集します。
* **確実なデータ収集**: 画面を少しずつスクロールし、収集範囲を重ねることで、読み込み漏れによるデータの取りこぼしを防ぎます。
* **CSV形式で出力**: 収集したデータは、「投稿者名」「ユーザーID」「ツイート本文」「ツイートURL」の項目でCSVファイルとしてダウンロードされます。

***

## 導入方法 (Installation)

1.  **UserScriptマネージャーの導入**
    ブラウザにUserScriptを導入するための拡張機能をインストールします。
    * [Tampermonkey](https://www.tampermonkey.net/): Chrome, Firefox, Edge, Safariなど主要なブラウザに対応しています。
    * [Violentmonkey](https://violentmonkey.github.io/): Chrome, Firefox, Edgeなどに対応するオープンソースのUserScriptマネージャーです。(推奨)
    * [Greasemonkey](https://addons.mozilla.org/ja/firefox/addon/greasemonkey/): Firefox専用のUserScriptマネージャーです。

2.  **スクリプトのインストール**
    お使いのUserScriptマネージャーのダッシュボードで「新規スクリプトを追加」を選択し、提供されたスクリプトのコードをすべてコピーして貼り付け、保存してください。

***

## 使い方 (How to Use)

1.  PCのブラウザで **[Xのブックマークページ](https://x.com/i/bookmarks)** を開きます。
2.  画面右側に表示される青いボタン **「全ブックマークをエクスポート」** をクリックします。
3.  スクリプトが自動でページをスクロールしながらブックマークの収集を開始します。ボタンの表示が「収集中... (xx件)」に変わり、現在の収集件数が表示されます。
    * 収集にはブックマークの件数に応じて時間がかかります。処理が完了するまで、タブを閉じずにお待ちください。
4.  収集が完了すると、`x_bookmarks_YYYYMMDD.csv` というファイル名でCSVファイルが自動的にダウンロードされます。

***

## 出力されるCSVファイルの形式

| ヘッダー (列名) | 内容 |
| :--- | :--- |
| `投稿者名` | ツイートしたユーザーの表示名 |
| `ユーザーID` | ユーザーのID（例: @username） |
| `ツイート本文` | ツイートのテキスト内容 |
| `ツイートURL` | ツイートの個別URL |

***

## 注意事項 (Disclaimer)

* 本スクリプトはXのUI（画面の構造）に依存しています。X側の仕様変更により、予告なく動作しなくなる可能性があります。
* ブックマークの件数が非常に多い場合、処理に時間がかかったり、ブラウザのメモリを多く消費することがあります。
* 本スクリプトは個人利用を目的としています。エクスポートしたデータの取り扱いには十分ご注意ください。

***

## 作者 (Author)

* Mekann

## ライセンス (License)

* 本スクリプトはMITライセンスのもとで公開されています。

