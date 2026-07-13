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

    // Gemini AIによる動的ツイート文の生成
    let generatedText = '';
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log("Generating dynamic tweet using Gemini AI...");
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const geminiPrompt = `
          あなたは最新コスメを紹介する人気トレンドアプリ「TrendGlow」の公式SNS担当（Xの投稿担当）です。
          以下のコスメ商品の特徴、価格、口コミなどを元に、X（旧Twitter）に投稿するための魅力的で親しみやすく、思わずクリックしたくなる日本語の紹介ポストを作成してください。

          【商品情報】
          順位: 第${rank}位
          ブランド: ${item.brand}
          商品名: ${item.name}
          カテゴリー: ${item.category} (サブカテゴリー: ${item.subCategory || 'なし'})
          価格: ¥${item.priceValue ? item.priceValue.toLocaleString() : '未定'}
          評価: ⭐${item.rating || '4.5'}
          特徴: ${desc}
          
          【投稿作成ルール】
          1. 語尾や口調は親しみやすく（「〜だよ！」「〜が凄すぎる…！」「ぜひチェックしてみてね」「これ本当にやばい🥹」などのコスメ垢のようなフランクでワクワクする表現を使ってください）。
          2. 文字数は120〜140文字程度に収めてください。
          3. ハッシュタグや外部リンク（URL）は含めないでください（プログラム側で後から自動追加します）。
          4. 「第${rank}位」または「第${rank}位のバズコスメ」という言葉を必ずどこかに入れてください。
          5. 余計な説明（「以下が作成したポストです」など）や、マークダウンの引用符などは一切含めず、投稿文のみを出力してください。
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: geminiPrompt,
        });
        
        generatedText = response.text.trim();
        // マークダウンのコードブロック等のクリーンアップ
        if (generatedText.startsWith('`')) {
          generatedText = generatedText.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').replace(/^`|`$/g, '');
        }
        console.log("Gemini successfully generated customized tweet!");
      } catch (geminiErr) {
        console.error("Gemini tweet generation failed, using fallback template:", geminiErr.message);
      }
    }

    if (!generatedText) {
      // 順位に応じたタイトルの切り替え
      const headerTitle = rank === 1 
        ? `✨ TrendGlow 本日の人気No.1コスメ ✨`
        : `💖 TrendGlow 本日の注目ピックアップ 💖`;

      generatedText = `${headerTitle}

【${item.brand}】${item.name}

${desc}

価格: ¥${item.priceValue ? item.priceValue.toLocaleString() : '未定'} (評価: ⭐${item.rating || '4.5'})`;
    }

    const text = `${generatedText}

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
