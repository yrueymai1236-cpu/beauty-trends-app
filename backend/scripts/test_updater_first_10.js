const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function test() {
  const cosmeticsFilePath = path.join(__dirname, '../data/cosmetics.json');
  const realCosmetics = JSON.parse(fs.readFileSync(cosmeticsFilePath, 'utf-8')).slice(0, 10);

  for (const item of realCosmetics) {
    let imageUrl = '';
    const query = encodeURIComponent(`${item.brand} ${item.name}`);
    const url = `https://search.rakuten.co.jp/search/mall/${query}/`;
    
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(res.data);
      let img = $('.searchresultitem img').first().attr('src');
      
      console.log(`Item: ${item.name} | Query: ${item.brand} ${item.name}`);
      console.log(`  HTML Length: ${res.data.length}`);
      console.log(`  searchresultitem count: ${$('.searchresultitem').length}`);
      console.log(`  Image found: "${img}"`);
      
      if (res.data.includes("ロボット")) {
        console.log("  WARNING: Robot detection page!");
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

test();
