// ==UserScript==
// @name         X Bookmarks Exporter (Progressive Scraping)
// @name:ja      X (Twitter) ブックマークエクスポーター
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Automatically scrolls to the bottom, progressively collecting bookmarks, and then exports them all as a CSV file.
// @description:ja 自動で最下部までスクロールしながら逐次ブックマークを収集し、すべてをCSVファイルとしてエクスポートします。
// @author       Mekann
// @match        https://x.com/i/bookmarks
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // --- スタイル定義 ---
    GM_addStyle(`
        .export-button-x {
            position: fixed; top: 100px; right: 20px; z-index: 9999;
            background-color: #1DA1F2; color: white; border: none;
            border-radius: 20px; padding: 10px 20px; font-size: 15px;
            font-weight: bold; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            transition: all 0.3s;
        }
        .export-button-x:hover { background-color: #0c85d0; }
        .export-button-x:disabled { background-color: #888; cursor: not-allowed; opacity: 0.7; }
    `);

    // --- ボタン作成 ---
    const exportButton = document.createElement('button');
    exportButton.innerText = '全ブックマークをエクスポート';
    exportButton.className = 'export-button-x';
    document.body.appendChild(exportButton);
    exportButton.addEventListener('click', autoScrollAndExport);

    // --- メイン処理 (修正版) ---
    function autoScrollAndExport() {
        // 重複を避けるため、ツイートURLをキーにしたMapを使用
        const collectedTweets = new Map();
        let lastHeight = 0;
        let consecutiveStops = 0;
        const maxConsecutiveStops = 3; // 3回連続で高さが変わらなければ終了

        exportButton.disabled = true;

        const scrollInterval = setInterval(() => {
            // --- 修正点：先にスクロールする ---
            window.scrollTo(0, document.body.scrollHeight);

            // スクロール後に新しいツイートが読み込まれるのを待つ
            setTimeout(() => {
                // 現在画面にあるツイートを収集
                scrapeVisibleTweets(collectedTweets);
                exportButton.innerText = `収集中... (${collectedTweets.size}件)`;

                const newHeight = document.body.scrollHeight;

                // スクロールが停止したかチェック
                if (newHeight === lastHeight) {
                    consecutiveStops++;
                } else {
                    consecutiveStops = 0; // 高さが変わったらリセット
                }
                lastHeight = newHeight;

                // 複数回連続で停止したら、スクロール完了とみなす
                if (consecutiveStops >= maxConsecutiveStops) {
                    clearInterval(scrollInterval);
                    console.log(`Scrolling complete. Total ${collectedTweets.size} unique bookmarks collected.`);

                    // 念のため最後にもう一度収集
                    scrapeVisibleTweets(collectedTweets);
                    exportButton.innerText = `エクスポート中... (${collectedTweets.size}件)`;

                    setTimeout(() => {
                        exportToCSV(collectedTweets);
                        resetButton(collectedTweets.size);
                    }, 1000);
                }
            }, 1500); // 1.5秒待ってから収集・判定する

        }, 2000); // 2秒ごとにスクロールを試みる
    }

    /**
     * 現在画面に表示されているツイートを解析し、Mapに格納する
     * @param {Map} targetMap - 収集したツイートを格納するMap
     */
    function scrapeVisibleTweets(targetMap) {
        document.querySelectorAll('article[data-testid="tweet"]').forEach(article => {
            try {
                // ツイートの個別URLを取得 (これがユニークなキーになる)
                const timeElement = article.querySelector('time');
                const permalinkElement = timeElement ? timeElement.closest('a') : null;
                const tweetUrl = permalinkElement ? permalinkElement.href : null;

                // URLが取得できない、または既に収集済みの場合はスキップ
                if (!tweetUrl || targetMap.has(tweetUrl)) {
                    return;
                }

                // 各種情報を取得
                const tweetTextElement = article.querySelector('div[data-testid="tweetText"]');
                const tweetText = tweetTextElement ? tweetTextElement.innerText.replace(/\n/g, ' ') : '';

                const userNameElement = article.querySelector('div[data-testid="User-Name"]');
                const authorName = userNameElement ? userNameElement.querySelector('span').innerText : '';
                const authorHandle = userNameElement ? userNameElement.querySelector('div[dir="ltr"]').innerText : '';

                // Mapにデータを格納
                targetMap.set(tweetUrl, { authorName, authorHandle, tweetText, tweetUrl });

            } catch (e) {
                // エラーが発生しても処理を続行
                console.error('Error processing a tweet:', e, article);
            }
        });
    }

    /**
     * 収集したデータをCSV形式でダウンロードする
     * @param {Map} dataMap - 収集済みのツイートデータ
     */
    function exportToCSV(dataMap) {
        if (dataMap.size === 0) {
            alert('ブックマークが見つかりませんでした。');
            return;
        }

        const csvRows = [
            ['投稿者名', 'ユーザーID', 'ツイート本文', 'ツイートURL'] // ヘッダー
        ];

        dataMap.forEach(tweet => {
            csvRows.push([tweet.authorName, tweet.authorHandle, tweet.tweetText, tweet.tweetUrl]);
        });

        const csvContent = csvRows.map(row =>
            row.map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        // BOMを付けてUTF-8でダウンロード
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        link.setAttribute('download', `x_bookmarks_${formattedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * ボタンの状態をリセットする
     */
    function resetButton(count) {
        exportButton.disabled = false;
        exportButton.innerText = `エクスポート完了 (${count}件)`;
        setTimeout(() => {
             exportButton.innerText = '全ブックマークをエクスポート';
        }, 5000); // 5秒後に元のテキストに戻す
    }
})();
