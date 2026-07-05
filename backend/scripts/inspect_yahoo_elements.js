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
    
    // Yahoo Shopping search items are typically structured inside elements.
    // Let's find elements that contain price, rating, and reviews.
    console.log("Searching Yahoo Shopping HTML elements...");
    
    // Find all spans or divs that match price class name pattern or contain price numbers
    $('div, span, p').each((i, el) => {
      const className = $(el).attr('class') || '';
      const text = $(el).text().trim();
      
      // Look for price
      if (className.includes('Price') || className.includes('price')) {
        console.log(`Price candidate: class="${className}" | text="${text}"`);
      }
      
      // Look for reviews
      if (className.includes('Review') || className.includes('review') || className.includes('Rate') || className.includes('rate')) {
        console.log(`Review/Rate candidate: class="${className}" | text="${text}"`);
      }
    });
  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test();
