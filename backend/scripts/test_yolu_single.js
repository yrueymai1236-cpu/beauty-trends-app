const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const queries = [
    'YOLU カームナイトリペア シャンプー ポンプ 単品'
  ];
  for (const q of queries) {
    console.log(`--- Query: ${q} ---`);
    const query = encodeURIComponent(q);
  try {
    const res = await axios.get(`https://shopping.yahoo.co.jp/search?p=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
      }
    });
    const $ = cheerio.load(res.data);
    
    $('[class*="SearchResultItem_"]').slice(0, 5).each((i, el) => {
      const title = $(el).find('[class*="ItemTitle_"]').first().text() || $(el).find('a').first().text() || '';
      const priceText = $(el).find('[class*="ItemPrice_ItemPrice__"]').first().text() || $(el).find('[class*="Price"]').first().text() || '';
      const image = $(el).find('img').filter((j, imgEl) => ($(imgEl).attr('src') || '').includes('item-shopping.c.yimg.jp')).first().attr('src') || '';
      
      console.log(`Result ${i + 1}:`);
      console.log(`  Title: ${title.trim()}`);
      console.log(`  Price: ${priceText.trim()}`);
      console.log(`  Image: ${image}`);
    });
  } catch (e) {
    console.error("Failed:", e.message);
  }
  }
}

test();
