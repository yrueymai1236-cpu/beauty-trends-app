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

module.exports = router;
