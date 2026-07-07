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
// 1. 午前9:00 (JST) / 00:00 (UTC) : トレンドデータを更新し、1位の商品をXに投稿
cron.schedule('0 0 * * *', async () => {
  console.log('Running morning trend updater and X post (Rank 1)...');
  try {
    await runUpdater();
    console.log('Daily trend updater completed successfully.');
    
    const postX = require('./scripts/postX');
    await postX(1); // 1位の商品を投稿
  } catch (err) {
    console.error("Error running morning cron workflow:", err.message);
  }
});

// 2. 午後20:00 (JST) / 11:00 (UTC) : 2位の注目商品をXにピックアップ投稿
cron.schedule('0 11 * * *', async () => {
  console.log('Running evening X pickup post (Rank 2)...');
  try {
    const postX = require('./scripts/postX');
    await postX(2); // 2位の商品を投稿
  } catch (err) {
    console.error("Error running evening cron workflow:", err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
