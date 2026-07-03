const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
