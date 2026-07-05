const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  // Let's test a couple of actual queries that trendUpdater ran
  const queries = [
    'DUO DUO ザ クレンジングバーム',
    'ファンケル ファンケル マイルドクレンジング オイル',
    'アテニア アテニア スキンクリア クレンズ オイル アロマタイプ',
  ];

  for (const q of queries) {
    const query = encodeURIComponent(q);
    try {
      const res = await axios.get(`https://search.rakuten.co.jp/search/mall/${query}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(res.data);
      const sri = $('.searchresultitem');
      console.log(`Query "${q}" -> searchresultitem length: ${sri.length}`);
    } catch (e) {
      console.error(`Failed for "${q}":`, e.message);
    }
  }
}

test();
