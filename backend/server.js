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
// 毎日深夜0時0分に自動実行
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily trend updater cron job...');
  try {
    await runUpdater();
    console.log('Daily trend updater completed successfully.');
    
    // 更新後にXにポスト
    const postX = require('./scripts/postX');
    await postX();
  } catch (err) {
    console.error("Error running daily cron workflow:", err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
