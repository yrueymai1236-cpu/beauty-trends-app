const fs = require('fs');
let content = fs.readFileSync('backend/cron/trendUpdater.js', 'utf-8');

const realCosmeticsWithDesc = `const realCosmetics = [
        { brand: 'KATE', name: 'リップモンスター', category: 'メイクアップ', subCategory: 'リップ', description: 'つけたての色がそのまま持続する、落ちにくい高発色リップ。保湿成分配合で乾燥しにくく、マスクを外しても美しい仕上がりをキープします。' },
        { brand: 'キャンメイク', name: 'マシュマロフィニッシュパウダー', category: 'メイクアップ', subCategory: 'フェイスパウダー', description: 'シルクのような滑らかなパウダーが毛穴や色ムラをカバー。テカリを防いで、思わず触りたくなるようなふんわりマシュマロ肌に仕上げます。' },
        { brand: 'セザンヌ', name: 'パールグロウハイライト', category: 'メイクアップ', subCategory: 'ハイライト', description: '高輝度なパールが肌の内側から発光しているようなツヤ感を与えます。プチプラとは思えない上品な仕上がりで、立体感のある顔立ちへ。' },
        { brand: 'ロムアンド', name: 'ジューシーラスティングティント', category: 'メイクアップ', subCategory: 'リップ', description: '果実シロップのようなみずみずしい光沢感と、長持ちする発色が特徴のティントリップ。ぷるんとした魅力的な唇を演出します。' },
        { brand: 'TIRTIR', name: 'マスクフィットレッドクッション', category: 'メイクアップ', subCategory: 'ファンデーション', description: '圧倒的なカバー力と密着力で、最長72時間崩れにくいクッションファンデーション。マスクへの色移りも防ぎ、なめらかなツヤ肌を保ちます。' },
        { brand: 'VT', name: 'CICA デイリースージングマスク', category: 'スキンケア', subCategory: 'パック', description: '1日1枚で簡単に肌の鎮静ケアができる大容量シートマスク。ツボクサエキス配合で、乾燥やマスク荒れによる肌トラブルを防ぎます。' },
        { brand: 'オバジ', name: 'オバジC25セラム ネオ', category: 'スキンケア', subCategory: '美容液', description: '極限まで配合されたピュアビタミンCが、毛穴、シミ、ハリ、キメ、シワにマルチにアプローチ。肌の奥から輝くような透明感を引き出します。' },
        { brand: 'キュレル', name: '潤浸保湿フェイスクリーム', category: 'スキンケア', subCategory: 'クリーム', description: 'セラミド機能成分配合で、乾燥性敏感肌を優しく潤すフェイスクリーム。ふっくらと吸い付くような潤いに満ちた肌へと導きます。' },
        { brand: 'YOLU', name: 'カームナイトリペアシャンプー', category: 'ヘアケア', subCategory: 'シャンプー', description: '睡眠中の髪の摩擦ダメージや乾燥を防ぐナイトキャップ発想のシャンプー。ネロリ＆ピオニーの安らぐ香りで、翌朝の髪を扱いやすくします。' },
        { brand: 'フィーノ', name: 'プレミアムタッチ 浸透美容液ヘアマスク', category: 'ヘアケア', subCategory: 'トリートメント', description: '6種類の美容液成分をギュッと凝縮したヘアマスク。ダメージを受けた毛先までなめらかに補修し、指通りの良いサラツヤ髪へ。' },
        { brand: '無印良品', name: 'マイルド洗顔フォーム', category: 'スキンケア', subCategory: '洗顔', description: '天然うるおい成分配合で、肌の水分を保ちながら優しく洗い上げる洗顔フォーム。泡立ちが良く、つっぱり感のない洗い上がりが特徴です。' },
        { brand: 'メラノCC', name: '薬用しみ対策 美白美容液', category: 'スキンケア', subCategory: '美容液', description: '活性型ビタミンCとビタミンE誘導体をW配合。メラニンの生成を抑え、シミ・そばかすを防ぎながら、ニキビ跡にもアプローチします。' },
        { brand: 'なめらか本舗', name: '豆乳イソフラボン リンクルアイクリーム', category: 'スキンケア', subCategory: 'アイクリーム', description: 'ピュアレチノールと豆乳発酵液を配合した高保湿アイクリーム。目元の乾燥や小じわを目立たなくし、ふっくらとしたハリを与えます。' },
        { brand: 'イプサ', name: 'ザ・タイムR アクア', category: 'スキンケア', subCategory: '化粧水', description: '肌表面に潤いの層をつくり、水分を逃がさない薬用化粧水。アルコールフリーで肌に優しく、みずみずしい透明感のある肌へ導きます。' },
        { brand: 'ルルルン', name: 'ルルルンピュア エブリーズ', category: 'スキンケア', subCategory: 'パック', description: '毎日のスキンケアに最適な、バランスの良い潤い成分を配合したフェイスマスク。肌の基礎力を高め、健やかでもっちりとした素肌へ。' },
        { brand: 'マキアージュ', name: 'ドラマティックスキンセンサーベース', category: 'メイクアップ', subCategory: '下地', description: 'テカリとカサつきをダブルで防ぐ、スキンケアまで叶えるくずれ防止下地。肌の水分バランスをコントロールし、化粧のりを良くします。' },
        { brand: 'ディオール', name: 'ディオール アディクト リップ マキシマイザー', category: 'メイクアップ', subCategory: 'リップ', description: 'ヒアルロン酸配合で、瞬時に唇をボリュームアップさせるケアリッププランパー。1日中潤いが続き、ふっくらとした魅力的な唇に。' },
        { brand: 'エクセル', name: 'スキニーリッチシャドウ', category: 'メイクアップ', subCategory: 'アイシャドウ', description: '肌なじみの良い4色がセットになった、失敗知らずのアイシャドウパレット。しっとりリッチな質感で、上品なグラデーションが簡単に完成。' },
        { brand: 'キャンメイク', name: 'クリーミータッチライナー', category: 'メイクアップ', subCategory: 'アイライナー', description: '1.5mmの超極細芯で、とろけるような描き心地のジェルライナー。一度乾くと密着して落ちにくく、くっきりとした目元を長時間キープします。' },
        { brand: 'デジャヴュ', name: '塗るつけまつげ ラッシュアップ', category: 'メイクアップ', subCategory: 'マスカラ', description: '超極細ブラシがうぶ毛のような細い見えないまつげまでキャッチ。根元からしっかりコーティングし、自然で際立つ目元を演出します。' },
        { brand: '＆honey', name: 'ディープモイスト シャンプー', category: 'ヘアケア', subCategory: 'シャンプー', description: 'ハチミツなどの保水成分を90%以上配合した、水分量14%の潤い髪を目指すシャンプー。パサつく髪の芯まで潤いを与え、まとまりのある髪へ。' },
        { brand: 'ナプラ', name: 'N. ポリッシュオイル', category: 'ヘアケア', subCategory: 'ヘアオイル', description: '天然由来成分のみで作られた、髪にも肌にも使えるマルチオイル。ツヤ感と軽い束感を与え、トレンドのウェットヘアスタイリングに最適です。' },
        { brand: 'オルビス', name: 'エッセンスインヘアミルク', category: 'ヘアケア', subCategory: 'ヘアミルク', description: '傷んだ髪の芯まで美容液成分が浸透し、しっとりまとまる髪へ導く洗い流さないトリートメント。無香料で使いやすく、柔らかな質感が続きます。' },
        { brand: 'ミジャンセン', name: 'パーフェクトセラム', category: 'ヘアケア', subCategory: 'ヘアオイル', description: '7種類の自然由来オイルをブレンドし、ダメージヘアを集中補修する韓国発の大人気ヘアセラム。パサつきを抑え、ツヤのある滑らかな髪へ。' },
        { brand: 'パンテーン', name: 'マカロン ヘアマスク', category: 'ヘアケア', subCategory: 'トリートメント', description: '1回使い切りの濃厚ヘアマスク。カラーやパーマで傷んだ髪に、サロン級の潤いとツヤをチャージし、特別な日の前のスペシャルケアにぴったりです。' },
        { brand: 'コスメデコルテ', name: 'リポソーム アドバンスト リペアセラム', category: 'スキンケア', subCategory: '美容液', description: '多重層バイオリポソームが角層深くへ浸透し、長時間潤いを放ち続ける導入美容液。あらゆる肌悩みにアプローチし、若々しいハリとツヤを与えます。' },
        { brand: 'ポール＆ジョー', name: 'モイスチュアライジング ファンデーション プライマー', category: 'メイクアップ', subCategory: '下地', description: '美容液成分を贅沢に配合し、潤いで満たしながら肌色をトーンアップさせる化粧下地。透明感あふれる、ツヤめくピュア肌を演出します。' },
        { brand: 'ウカ', name: 'スカルプブラシ ケンザン', category: 'ヘアケア', subCategory: 'その他', description: '自宅で簡単に本格的な頭皮マッサージができるシリコーン製スカルプブラシ。シャンプー時やツボ押しに使えば、頭皮のコリをほぐしてリフレッシュ。' },
        { brand: 'イニスフリー', name: 'ノーセバム ミネラルパウダー', category: 'メイクアップ', subCategory: 'フェイスパウダー', description: '皮脂吸着パウダーが余分な皮脂をコントロールし、赤ちゃんのようなすべすべ肌に保つパウダー。前髪のベタつき直しにも使える万能アイテムです。' },
        { brand: 'ジルスチュアート', name: 'リップブーケ セラム', category: 'メイクアップ', subCategory: 'リップ', description: '花束のような華やかなデザインと、高い保湿効果を兼ね備えたリップ美容液。プランプ効果でふっくらとした唇を作り、自然な血色感を与えます。' }
      ];`;

content = content.replace(/const realCosmetics = \[[\s\S]*?\];/, realCosmeticsWithDesc);
content = content.replace(/source: 'Instagram',/g, "source: 'Instagram',\n          description: item.description,");
content = content.replace(/if \(!samplePosts\) {/g, 'if (true) { // FORCED FOR DESC');

fs.writeFileSync('backend/cron/trendUpdater.js', content);
console.log('Patched trendUpdater.js');
