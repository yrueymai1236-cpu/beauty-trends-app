const express = require('express');
const router = express.Router();
const supabase = require('../db/supabaseClient');

// 現在はシミュレーターではなくSupabaseからデータを取得する
router.get('/trends', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection is not configured.' });
    }

    // Supabaseのproductsテーブルから必要な軽量データのみを取得し、likesの降順でソート
    const { data, error } = await supabase
      .from('products')
      .select('id, name, brand, category, subCategory, priceValue, image, rating, reviewcount, likes, source')
      .order('likes', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.json([]); 
    }

    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch trends from database' });
  }
});

// いいね追加API
router.post('/trends/:id/like', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { data: product, error: fetchError } = await supabase.from('products').select('likes').eq('id', id).single();
    if (fetchError || !product) throw fetchError || new Error('Product not found');
    
    const { error: updateError } = await supabase.from('products').update({ likes: product.likes + 1 }).eq('id', id);
    if (updateError) throw updateError;
    
    res.json({ success: true, likes: product.likes + 1 });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to add like' });
  }
});

// いいね取り消しAPI
router.post('/trends/:id/unlike', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { data: product, error: fetchError } = await supabase.from('products').select('likes').eq('id', id).single();
    if (fetchError || !product) throw fetchError || new Error('Product not found');
    
    const newLikes = Math.max(0, product.likes - 1);
    const { error: updateError } = await supabase.from('products').update({ likes: newLikes }).eq('id', id);
    if (updateError) throw updateError;
    
    res.json({ success: true, likes: newLikes });
  } catch (error) {
    console.error('Unlike error:', error);
    res.status(500).json({ error: 'Failed to remove like' });
  }
});

// AIチャットAPI
const { GoogleGenAI } = require('@google/genai');
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!ai) return res.status(500).json({ reply: 'AIキーが設定されていません。' });

    // AIに渡すための全商品情報（軽量化して取得）
    const { data: products } = await supabase.from('products').select('name, brand, category, subCategory, description, priceValue, likes');
    const catalog = JSON.stringify(products);

    const prompt = `
      あなたは「TrendGlow」の専属AI美容部員です。ユーザーの悩みや要望に対して、以下の製品カタログから最適なものを1〜3つ選び、親しみやすいトーンで提案してください。
      マークダウンを使って見やすく装飾してください。回答は短く簡潔に（300文字以内推奨）。
      
      重要：おすすめの商品を提示した場合は、回答の最後に必ず以下の形式で推奨商品名だけを出力してください。括弧の前にスペースを入れず、完全一致の商品名にしてください。
      フォーマット: [RECS: 商品名1, 商品名2]
      例: 乾燥肌にはオルビスがおすすめです。[RECS: オルビスユー エッセンスローション]

      製品カタログ: ${catalog}
      ユーザーのメッセージ: ${message}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ reply: '申し訳ありません、現在AIサーバーが混み合っております。少し後でもう一度お試しください！' });
  }
});

// --- Web Push 設定 ---
const webpush = require('web-push');
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@trendglow.beauty',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// 1. AIによる口コミ要約API
router.get('/trends/:id/summary', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { data: product, error } = await supabase
      .from('products')
      .select('brand, name, description, source, review_summary')
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // キャッシュ済みの要約があれば即座に返却
    if (product.review_summary) {
      return res.json({
        description: product.description,
        positives: product.review_summary.positives,
        negatives: product.review_summary.negatives
      });
    }

    if (!ai) {
      return res.json({
        description: product.description,
        positives: ["SNSでバズり中の人気トレンド商品です", "使い勝手の良さや高い保湿力が評価されています", "口コミでの満足度が非常に高い名品です"],
        negatives: ["人気のため店舗によって品薄な場合があります", "肌質や好みの香りによって相性があるようです"]
      });
    }

    const prompt = `
      あなたは美容の専門家です。以下のコスメ商品について、ネット上の口コミや評判を分析し、
      購入を検討しているユーザーに向けて、簡潔な「メリット（良い点）3つ」と「デメリット・注意点2つ」を抽出してください。
      
      商品情報:
      ブランド: ${product.brand}
      商品名: ${product.name}
      商品説明: ${product.description}
      SNS情報: ${product.source}で話題

      必ず以下のJSONフォーマットのみで回答してください。前後のマークダウンや解説文は一切含めないでください。
      {
        "positives": ["メリット1", "メリット2", "メリット3"],
        "negatives": ["デメリット1", "デメリット2"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let summaryText = response.text.trim();
    if (summaryText.startsWith('```')) {
      summaryText = summaryText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    let summaryJson;
    try {
      summaryJson = JSON.parse(summaryText);
    } catch (e) {
      console.warn("Failed to parse Gemini summary output as JSON:", summaryText);
      summaryJson = {
        positives: ["SNSでバズり中の人気トレンド商品です", "使い心地の良さが評価されています", "満足度が高い名品です"],
        negatives: ["人気のため品薄な場合があります", "好みの香りや質感で相性があります"]
      };
    }

    // データベースにキャッシュ保存
    await supabase
      .from('products')
      .update({ review_summary: summaryJson })
      .eq('id', id);

    res.json({
      description: product.description,
      positives: summaryJson.positives,
      negatives: summaryJson.negatives
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Failed to generate review summary' });
  }
});

// 2. 順位推移履歴取得API
router.get('/trends/:id/history', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { data, error } = await supabase
      .from('rank_history')
      .select('rank, recorded_date')
      .eq('product_id', id)
      .order('recorded_date', { ascending: true })
      .limit(7);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Failed to fetch rank history' });
  }
});

// 3. プッシュ通知公開キーの取得API
router.get('/push/key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
});

// 4. プッシュ通知購読登録API
router.post('/push/register', async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Subscription data is required' });
    }

    // 重複登録の防止
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('subscription->>endpoint', subscription.endpoint)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.json({ success: true, message: 'Already registered' });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .insert([{ subscription }]);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Push register error:', err);
    res.status(500).json({ error: 'Failed to register subscription' });
  }
});

// 5. アフィリエイトID・各種設定の取得API
router.get('/config', (req, res) => {
  res.json({
    amazonTrackingId: process.env.AMAZON_TRACKING_ID || 'hurikake09-22',
    rakutenAffiliateId: process.env.RAKUTEN_AFFILIATE_ID || '5575e209.dc820559.5575e20a.58f7287d',
    qoo10AffiliateSu: process.env.QOO10_AFFILIATE_SU || '1467680797'
  });
});

module.exports = router;
