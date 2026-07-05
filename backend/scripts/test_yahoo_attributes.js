const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const query = encodeURIComponent('DUO ザ クレンジングバーム');
  try {
    const res = await axios.get(`https://shopping.yahoo.co.jp/search?p=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
      }
    });
    const $ = cheerio.load(res.data);
    
    console.log("Inspecting Yahoo Shopping review star elements...");
    $('div[class*="review"], span[class*="review"], div[class*="Review"], span[class*="Review"]').slice(0, 10).each((i, el) => {
      console.log(`El ${i}: class="${$(el).attr('class')}"`);
      console.log(`  text="${$(el).text().trim()}"`);
      console.log(`  aria-label="${$(el).attr('aria-label')}"`);
      console.log(`  title="${$(el).attr('title')}"`);
      console.log(`  data-rate="${$(el).attr('data-rate')}"`);
    });
  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test();
