const express = require('express');
const router = express.Router();
const supabase = require('../db/supabaseClient');

// 現在はシミュレーターではなくSupabaseからデータを取得する
router.get('/trends', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection is not configured.' });
    }

    // Supabaseのproductsテーブルから全てのデータを取得し、likesの降順でソート
    const { data, error } = await supabase
      .from('products')
      .select('*')
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

module.exports = router;
