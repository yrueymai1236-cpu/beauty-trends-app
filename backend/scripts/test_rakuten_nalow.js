const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const query = encodeURIComponent('NALOW シャンプー');
  try {
    const res = await axios.get(`https://search.rakuten.co.jp/search/mall/${query}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(res.data);
    
    console.log("Rakuten search results for NALOW shampoo:");
    $('.searchresultitem').slice(0, 5).each((i, el) => {
      const title = $(el).find('.title').first().text() || $(el).find('a').first().text() || '';
      const priceText = $(el).find('div[class*="price--"]').first().text() || '';
      const image = $(el).find('img').first().attr('src') || '';
      
      console.log(`Result ${i + 1}:`);
      console.log(`  Title: ${title.trim()}`);
      console.log(`  Price: ${priceText.trim()}`);
      console.log(`  Image: ${image}`);
    });
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

test();
