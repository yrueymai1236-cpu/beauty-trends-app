const { TwitterApi } = require('twitter-api-v2');
const supabase = require('../db/supabaseClient');

async function postX() {
  console.log("Starting daily X posting task...");

  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.warn("X API credentials are not set in .env. Skipping automatic post.");
    return false;
  }

  try {
    // 1位の人気商品（いいね数が一番多い商品）を取得
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('likes', { ascending: false })
      .limit(1);

    if (error || !products || products.length === 0) {
      throw error || new Error("No products found in database to post.");
    }

    const item = products[0];
    const shareUrl = `https://beauty-trends-app.onrender.com/?share=${item.id}`;
    
    let desc = item.description || '';
    if (desc.length > 90) {
      desc = desc.substring(0, 87) + '...';
    }

    const text = `✨ TrendGlow 本日の美容トレンド1位 ✨

【${item.brand}】${item.name}

${desc}

価格: ¥${item.priceValue ? item.priceValue.toLocaleString() : '未定'} (評価: ⭐${item.rating || '4.5'})

👇 詳細・購入はこちら！
${shareUrl}`;

    console.log("Generated Tweet content:\n", text);

    // X API クライアント初期化
    const userClient = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });

    const v2Client = userClient.v2;

    // ツイート投稿
    const tweet = await v2Client.tweet(text);
    console.log(`Successfully posted to X! Tweet ID: ${tweet.data.id}`);
    return true;
  } catch (error) {
    console.error("Failed to post on X:", error.message);
    return false;
  }
}

module.exports = postX;

// コマンドラインから直接実行された場合
if (require.main === module) {
  require('dotenv').config();
  postX();
}
