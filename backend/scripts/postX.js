const { TwitterApi } = require('twitter-api-v2');
const supabase = require('../db/supabaseClient');
const axios = require('axios');

async function postX(rank = 1) {
  console.log(`Starting X posting task (Rank: ${rank})...`);

  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.warn("X API credentials are not set in .env. Skipping automatic post.");
    return false;
  }

  try {
    // データベースから指定された順位の商品を取得
    // 1位＝index 0, 2位＝index 1, 3位＝index 2 ...
    const offset = Math.max(0, rank - 1);
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('likes', { ascending: false })
      .range(offset, offset);

    if (error || !products || products.length === 0) {
      throw error || new Error(`No product found in database at rank ${rank} to post.`);
    }

    const item = products[0];
    const shareUrl = `https://beauty-trends-app.onrender.com/?share=${item.id}`;
    
    let desc = item.description || '';
    if (desc.length > 80) {
      desc = desc.substring(0, 77) + '...';
    }

    // 1. 動的なハッシュタグの自動構成
    let hashtags = "#コスメトレンド #美容 #コスメ紹介";
    if (item.category === 'スキンケア') {
      hashtags = "#スキンケア #美容液 #保湿 #美肌ケア";
    } else if (item.category === 'メイクアップ') {
      hashtags = "#メイクアップ #アイシャドウ #リップ #時短メイク";
    } else if (item.category === 'ヘアケア') {
      hashtags = "#ヘアケア #ヘアオイル #美髪 #うるツヤ";
    } else if (item.category === 'ボディケア') {
      hashtags = "#ボディケア #乾燥対策 #ボディクリーム";
    } else if (item.category === 'フレグランス') {
      hashtags = "#フレグランス #香水 #香水レポ #いい香り";
    }

    // サブカテゴリをタグに追加 (空白除去)
    if (item.subCategory) {
      const subTag = `#${item.subCategory.replace(/\s+/g, '')}`;
      hashtags += ` ${subTag}`;
    }

    // 価格帯に応じたプチプラ/デパコスタグ
    if (item.priceValue && item.priceValue < 2000) {
      hashtags += " #プチプラコスメ";
    } else if (item.priceValue && item.priceValue >= 5000) {
      hashtags += " #デパコス";
    }

    // 順位に応じたタイトルの切り替え
    const headerTitle = rank === 1 
      ? `✨ TrendGlow 本日の人気No.1コスメ ✨`
      : `💖 TrendGlow 本日の注目ピックアップ 💖`;

    const text = `${headerTitle}

【${item.brand}】${item.name}

${desc}

価格: ¥${item.priceValue ? item.priceValue.toLocaleString() : '未定'} (評価: ⭐${item.rating || '4.5'})

👇 詳細・お気に入り登録はプロフィールのURLからチェック！

${hashtags}`;

    console.log("Generated Tweet content:\n", text);

    // X API クライアント初期化
    const userClient = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });

    const v2Client = userClient.v2;

    // 2. 画像の自動ダウンロードとアップロード
    let mediaId = null;
    if (item.image) {
      try {
        console.log(`Downloading product image from: ${item.image}`);
        const response = await axios.get(item.image, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        const contentType = response.headers['content-type'] || 'image/jpeg';
        
        console.log(`Uploading media to X (Type: ${contentType})...`);
        mediaId = await userClient.v1.uploadMedia(buffer, { mimeType: contentType });
        console.log(`Successfully uploaded image. Media ID: ${mediaId}`);
      } catch (imgErr) {
        console.error("Failed to process image attachment:", imgErr.message);
      }
    }

    // ツイート投稿 (画像があれば添付)
    const tweetPayload = { text: text };
    if (mediaId) {
      tweetPayload.media = { media_ids: [mediaId] };
    }

    const tweet = await v2Client.tweet(tweetPayload);
    console.log(`Successfully posted to X! Tweet ID: ${tweet.data.id}`);
    return true;
  } catch (error) {
    console.error("Failed to post on X:", error.message);
    return false;
  }
}

module.exports = postX;

// コマンドラインから直接実行された場合 (テスト用、引数で順位指定可能)
if (require.main === module) {
  require('dotenv').config();
  const args = process.argv.slice(2);
  const targetRank = args[0] ? parseInt(args[0], 10) : 1;
  postX(targetRank);
}
