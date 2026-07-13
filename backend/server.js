const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const apiRoutes = require('./routes/api');
const runUpdater = require('./cron/trendUpdater');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// --- Deployment Setup ---
// フロントエンドのビルド結果（distフォルダ）を静的ファイルとして配信
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// API以外のすべてのリクエストに対して、Reactのindex.htmlを返す（ルーティング対応）
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// --- Cron Job Setup ---
// 1. 午前9:00 (JST) / 00:00 (UTC) : トレンドデータを更新し、上位1〜5位のランダムな商品をXに投稿
cron.schedule('0 0 * * *', async () => {
  console.log('Running morning trend updater and X post...');
  try {
    await runUpdater();
    console.log('Daily trend updater completed successfully.');
    
    const postX = require('./scripts/postX');
    const randomRank = Math.floor(Math.random() * 5) + 1; // 1位〜5位からランダムに選定
    await postX(randomRank);
  } catch (err) {
    console.error("Error running morning cron workflow:", err.message);
  }
});

// 2. 午後20:00 (JST) / 11:00 (UTC) : 6〜15位の注目商品をランダムにXにピックアップ投稿
cron.schedule('0 11 * * *', async () => {
  console.log('Running evening X pickup post...');
  try {
    const postX = require('./scripts/postX');
    const randomRank = Math.floor(Math.random() * 10) + 6; // 6位〜15位からランダムに選定
    await postX(randomRank);
  } catch (err) {
    console.error("Error running evening cron workflow:", err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
