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
    
    // Print first 5 items HTML or classes
    console.log("Checking class names...");
    const items = $('div[class*="item"]');
    console.log(`Found div items: ${items.length}`);
    
    // Check specific class searchresultitem
    const sri = $('.searchresultitem');
    console.log(`searchresultitem length: ${sri.length}`);
    
    // Check images
    $('img').slice(0, 10).each((i, el) => {
      console.log(`Img ${i}: ${$(el).attr('src')}`);
    });
    
    // Print some body text
    console.log("Body length:", res.data.length);
    if (res.data.includes("ロボット")) {
      console.log("WARNING: CAPTCHA / Robot detection page returned!");
    }
  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test();
