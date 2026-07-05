const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const query = encodeURIComponent('DUO ザ クレンジングバーム');
  try {
    const res = await axios.get(`https://search.rakuten.co.jp/search/mall/${query}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(res.data);
    
    console.log("Checking searchresultitem images...");
    $('.searchresultitem').slice(0, 5).each((i, el) => {
      const img = $(el).find('img');
      console.log(`Item ${i}:`);
      img.each((j, imgEl) => {
        console.log(`  Img ${j}: src="${$(imgEl).attr('src')}" | data-src="${$(imgEl).attr('data-src')}" | class="${$(imgEl).attr('class')}"`);
      });
    });
  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test();
