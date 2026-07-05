const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const query = encodeURIComponent('DUO ザ クレンジングバーム');
  try {
    const res = await axios.get(`https://shopping.yahoo.co.jp/search?p=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(res.data);
    
    // Yahoo Shopping uses standard image tags. Let's find them.
    console.log("Checking Yahoo Shopping images...");
    const imgs = $('img');
    console.log(`Found ${imgs.length} images.`);
    imgs.slice(0, 15).each((i, el) => {
      console.log(`Img ${i}: src="${$(el).attr('src')}" | alt="${$(el).attr('alt')}"`);
    });
  } catch (e) {
    console.error("Yahoo test failed:", e.message);
  }
}

test();
