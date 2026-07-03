// このファイルは各SNS（TikTok, Instagram, Twitterなど）からのデータ収集と集約をシミュレートします。
// 本番環境では、ここで公式APIの呼び出しやPuppeteer等によるスクレイピング処理を実行します。

const scrapeTikTok = async () => {
  return new Promise((resolve) => setTimeout(() => {
    resolve([
      {
        id: 2,
        name: "TIRTIR マスクフィットレッドクッション",
        brand: "TIRTIR",
        category: "メイクアップ",
        subCategory: "ベースメイク",
        image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        source: "TikTok バズ",
        price: "¥2,970",
        priceValue: 2970,
        likes: "45K",
        likesValue: 45000,
        description: "密着力が高く、マスクに付きにくいとSNSで大バズり中のクッションファンデーション。",
        ageGroup: "10代後半〜30代",
        colors: ["17C PORCELAIN", "21N IVORY", "23N SAND"],
        reviews: [
          { user: "Gさん", comment: "本当に崩れない！カバー力も高くてコンシーラーいらずです。", rating: 5 }
        ],
        recommendedBy: [
          { name: "YouTuber サヤ", avatar: "https://i.pravatar.cc/150?u=saya" }
        ]
      },
      {
        id: 7,
        name: "Rom&nd ジューシーラスティングティント",
        brand: "rom&nd",
        category: "メイクアップ",
        subCategory: "リップ",
        image: "https://images.unsplash.com/photo-1596462502278-27bf85033c44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        source: "TikTok 定番",
        price: "¥1,320",
        priceValue: 1320,
        likes: "65K",
        likesValue: 65000,
        description: "果汁のようなシロップコーティングで、時間が経つほど凸凹を滑らかに。",
        ageGroup: "10代〜20代",
        colors: ["06 フィグフィグ", "07 ジュジュブ", "25 ベアグレープ"],
        reviews: [
          { user: "Eさん", comment: "ベアグレープの絶妙なくすみピンクが最高に可愛い！落ちにくいのも◎", rating: 5 }
        ],
        recommendedBy: [
          { name: "イエベ春 ゆう", avatar: "https://i.pravatar.cc/150?u=yu" }
        ]
      },
      {
        id: 6,
        name: "キュレル 潤浸保湿 フェイスクリーム",
        brand: "Curel",
        category: "スキンケア",
        subCategory: "クリーム",
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        source: "TikTok スキンケア部",
        price: "¥2,530",
        priceValue: 2530,
        likes: "55K",
        likesValue: 55000,
        description: "乾燥性敏感肌を考えた、セラミド機能成分配合の優しく高保湿なフェイスクリーム。",
        ageGroup: "20代〜50代 (敏感肌層)",
        colors: ["標準パッケージ"],
        reviews: [
          { user: "Lさん", comment: "肌荒れしていてもこれだけはしみない。お守りコスメです。", rating: 5 }
        ],
        recommendedBy: [
          { name: "皮膚科医 T", avatar: "https://i.pravatar.cc/150?u=doctor" }
        ]
      }
    ]);
  }, 200));
};

const scrapeInstagram = async () => {
  return new Promise((resolve) => setTimeout(() => {
    resolve([
      {
        id: 3,
        name: "VT COSMETICS リードルショット100",
        brand: "VT",
        category: "スキンケア",
        subCategory: "美容液",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        source: "Instagram トレンド",
        price: "¥3,520",
        priceValue: 3520,
        likes: "32K",
        likesValue: 32000,
        description: "天然の微細針が肌を刺激し、美容成分の浸透をサポートする導入美容液。",
        ageGroup: "20代後半〜40代",
        colors: ["標準パッケージ"],
        reviews: [
          { user: "Iさん", comment: "チクチクするけど翌朝の肌のツルツル感がすごい！", rating: 5 }
        ],
        recommendedBy: [
          { name: "スキンケア専門家", avatar: "https://i.pravatar.cc/150?u=expert" }
        ]
      },
      {
        id: 8,
        name: "Dior アディクト リップ マキシマイザー",
        brand: "Dior",
        category: "メイクアップ",
        subCategory: "リップ",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        source: "Instagram コスメ部",
        price: "¥4,620",
        priceValue: 4620,
        likes: "120K",
        likesValue: 120000,
        description: "瞬時にふっくら潤う、ディオールのアイコン的リッププランパー。",
        ageGroup: "20代〜40代 (幅広い年齢層)",
        colors: ["001 ピンク", "018 インテンス スパイス"],
        reviews: [
          { user: "Cさん", comment: "これがないと無理！保湿力が抜群で、縦ジワが一瞬で消えます。", rating: 5 }
        ],
        recommendedBy: [
          { name: "美容部員 S", avatar: "https://i.pravatar.cc/150?u=s" }
        ]
      }
    ]);
  }, 150));
};

const scrapeTwitterAndOthers = async () => {
  return new Promise((resolve) => setTimeout(() => {
    resolve([
      {
        id: 1,
        name: "キャンメイク むちぷるティント",
        brand: "CANMAKE",
        category: "メイクアップ",
        subCategory: "リップ",
        image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        source: "X (Twitter) バズ",
        price: "¥770",
        priceValue: 770,
        likes: "22.5K",
        likesValue: 22500,
        description: "むっちりとしたボリューム感とツヤが続く、プランパー効果付きのリップティント。",
        ageGroup: "主に10代〜20代前半",
        colors: ["01 バタースコッチ", "02 モモ", "03 ワインベリー"],
        reviews: [
          { user: "Aさん", comment: "色持ちが良くて、プランパー効果で唇がぷっくりします！コスパ最強。", rating: 5 }
        ],
        recommendedBy: [
          { name: "美容垢 Rina", avatar: "https://i.pravatar.cc/150?u=rina" }
        ]
      },
      {
        id: 5,
        name: "オルビス(ORBIS) エッセンスインヘアミルク",
        brand: "ORBIS",
        category: "ヘアケア",
        subCategory: "トリートメント",
        image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        source: "LIPS ベスコス",
        price: "¥1,320",
        priceValue: 1320,
        likes: "89K",
        likesValue: 89000,
        description: "パサつきを抑え、しっとりまとまる髪へ導く洗い流さないトリートメント。",
        ageGroup: "全年齢層",
        colors: ["無香料"],
        reviews: [
          { user: "Kさん", comment: "ベタつかないのにしっかり潤います。無香料なので他のスタイリング剤の邪魔をしないのも良い。", rating: 5 }
        ],
        recommendedBy: [
          { name: "美容師 Nao", avatar: "https://i.pravatar.cc/150?u=nao" }
        ]
      }
    ]);
  }, 250));
};

const getTrendData = async () => {
  try {
    // 3つのプラットフォームからのデータ収集を並行して実行
    const [tiktokData, instaData, twitterData] = await Promise.all([
      scrapeTikTok(),
      scrapeInstagram(),
      scrapeTwitterAndOthers()
    ]);

    // データを集約
    const aggregatedData = [...tiktokData, ...instaData, ...twitterData];
    
    // いいね数（人気度）で降順にソートしてランキング化
    aggregatedData.sort((a, b) => b.likesValue - a.likesValue);

    return aggregatedData;
  } catch (error) {
    console.error("Aggregation failed:", error);
    throw error;
  }
};

module.exports = {
  getTrendData
};
