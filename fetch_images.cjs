const { image_search } = require('duckduckgo-images-api');
const fs = require('fs');

const products = [
  { brand: 'キャンメイク', name: 'マシュマロフィニッシュパウダー', category: 'メイクアップ', subCategory: 'フェイスパウダー' },
  { brand: 'KATE', name: 'リップモンスター', category: 'メイクアップ', subCategory: 'リップ' },
  { brand: 'セザンヌ', name: 'パールグロウハイライト', category: 'メイクアップ', subCategory: 'ハイライト' },
  { brand: 'ロムアンド', name: 'ジューシーラスティングティント', category: 'メイクアップ', subCategory: 'リップ' },
  { brand: 'TIRTIR', name: 'マスクフィットレッドクッション', category: 'メイクアップ', subCategory: 'ファンデーション' },
  { brand: 'VT', name: 'CICA デイリースージングマスク', category: 'スキンケア', subCategory: 'パック' },
  { brand: 'オバジ', name: 'オバジC25セラム ネオ', category: 'スキンケア', subCategory: '美容液' },
  { brand: 'キュレル', name: '潤浸保湿フェイスクリーム', category: 'スキンケア', subCategory: 'クリーム' },
  { brand: 'YOLU', name: 'カームナイトリペアシャンプー', category: 'ヘアケア', subCategory: 'シャンプー' },
  { brand: 'フィーノ', name: 'プレミアムタッチ 浸透美容液ヘアマスク', category: 'ヘアケア', subCategory: 'トリートメント' },
  
  { brand: '無印良品', name: 'マイルド洗顔フォーム', category: 'スキンケア', subCategory: '洗顔' },
  { brand: 'メラノCC', name: '薬用しみ対策 美白美容液', category: 'スキンケア', subCategory: '美容液' },
  { brand: 'なめらか本舗', name: '豆乳イソフラボン リンクルアイクリーム', category: 'スキンケア', subCategory: 'アイクリーム' },
  { brand: 'イプサ', name: 'ザ・タイムR アクア', category: 'スキンケア', subCategory: '化粧水' },
  { brand: 'ルルルン', name: 'ルルルンピュア エブリーズ', category: 'スキンケア', subCategory: 'パック' },

  { brand: 'マキアージュ', name: 'ドラマティックスキンセンサーベース', category: 'メイクアップ', subCategory: '下地' },
  { brand: 'ディオール', name: 'ディオール アディクト リップ マキシマイザー', category: 'メイクアップ', subCategory: 'リップ' },
  { brand: 'エクセル', name: 'スキニーリッチシャドウ', category: 'メイクアップ', subCategory: 'アイシャドウ' },
  { brand: 'キャンメイク', name: 'クリーミータッチライナー', category: 'メイクアップ', subCategory: 'アイライナー' },
  { brand: 'デジャヴュ', name: '塗るつけまつげ ラッシュアップ', category: 'メイクアップ', subCategory: 'マスカラ' },

  { brand: '＆honey', name: 'ディープモイスト シャンプー', category: 'ヘアケア', subCategory: 'シャンプー' },
  { brand: 'ナプラ', name: 'N. ポリッシュオイル', category: 'ヘアケア', subCategory: 'ヘアオイル' },
  { brand: 'オルビス', name: 'エッセンスインヘアミルク', category: 'ヘアケア', subCategory: 'ヘアミルク' },
  { brand: 'ミジャンセン', name: 'パーフェクトセラム', category: 'ヘアケア', subCategory: 'ヘアオイル' },
  { brand: 'パンテーン', name: 'マカロン ヘアマスク', category: 'ヘアケア', subCategory: 'トリートメント' },

  { brand: 'コスメデコルテ', name: 'リポソーム アドバンスト リペアセラム', category: 'スキンケア', subCategory: '美容液' },
  { brand: 'ポール＆ジョー', name: 'モイスチュアライジング ファンデーション プライマー', category: 'メイクアップ', subCategory: '下地' },
  { brand: 'ウカ', name: 'スカルプブラシ ケンザン', category: 'ヘアケア', subCategory: 'その他' },
  { brand: 'イニスフリー', name: 'ノーセバム ミネラルパウダー', category: 'メイクアップ', subCategory: 'フェイスパウダー' },
  { brand: 'ジルスチュアート', name: 'リップブーケ セラム', category: 'メイクアップ', subCategory: 'リップ' }
];

async function main() {
  const results = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const query = `${p.brand} ${p.name} コスメ`;
    console.log(`Searching for: ${query}`);
    let imgUrl = null;
    try {
      const res = await image_search({ query, moderate: true });
      if (res && res.length > 0) {
        imgUrl = res[0].image;
      }
    } catch(e) {
      console.log('Error fetching image for', query);
    }
    
    results.push({
      ...p,
      priceValue: 1000 + (i * 200),
      likes: 5000 - (i * 100),
      ageGroup: '10代〜30代',
      source: 'Instagram',
      image: imgUrl
    });
    
    // sleep
    await new Promise(r => setTimeout(r, 1000));
  }
  
  fs.writeFileSync('real_products.json', JSON.stringify(results, null, 2));
  console.log('Done!');
}

main();
