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
    
    console.log("Checking price element classes...");
    const sri = $('.searchresultitem').first();
    console.log("Item text snippet:", sri.text().substring(0, 300));
    
    // Find all spans or divs with numbers that look like prices
    sri.find('div, span, p').each((i, el) => {
      const txt = $(el).text().trim();
      if (txt.includes('円') || txt.includes('¥') || /^[0-9,]+$/.test(txt)) {
        console.log(`El ${i}: tag="${el.name}" | class="${$(el).attr('class')}" | text="${txt}"`);
      }
    });
  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test();
