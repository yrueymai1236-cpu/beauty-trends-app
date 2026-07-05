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
    
    console.log("Inspecting Yahoo Shopping search item contents...");
    // Let's find divs containing item information. Usually, they have data-crid or are under list items.
    // Let's print out the text of some elements that might contain prices and ratings.
    const items = $('li[class*="LoopCard"], div[class*="LoopCard"]');
    console.log(`Found items: ${items.length}`);
    
    // Let's look for any text containing "円" (price) or "点" (rating) or "件" (reviews) inside the first item
    const firstItem = items.length > 0 ? items.first() : $('div').filter((i, el) => $(el).text().includes('円')).first();
    console.log("First item text snippet:", firstItem.text().substring(0, 300));
    
    // Look for all text elements with numbers and 円/点/件
    firstItem.find('*').each((i, el) => {
      const txt = $(el).text().trim();
      if (txt.includes('円') || txt.includes('★') || /^[0-9,]+$/.test(txt)) {
        console.log(`El ${i}: tag="${el.name}" | class="${$(el).attr('class')}" | text="${txt}"`);
      }
    });
  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test();
