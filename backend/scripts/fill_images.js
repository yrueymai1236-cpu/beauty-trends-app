const axios = require('axios');
const cheerio = require('cheerio');
const supabase = require('../db/supabaseClient');

async function fill() {
  console.log("Starting image populator from Yahoo Shopping...");
  try {
    // Get products with empty image
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, brand')
      .or('image.eq.,image.is.null')
      .limit(1050); // Process all products
      
    if (error) throw error;
    console.log(`Found ${products.length} products with no image.`);

    for (const item of products) {
      console.log(`Processing ID: ${item.id} | ${item.brand} ${item.name}...`);
      const query = encodeURIComponent(`${item.brand} ${item.name}`);
      let imageUrl = '';
      
      try {
        const res = await axios.get(`https://shopping.yahoo.co.jp/search?p=${query}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
          }
        });
        const $ = cheerio.load(res.data);
        
        // Find first image matching Yahoo Shopping item domain
        const found = $('img').filter((i, el) => {
          const src = $(el).attr('src') || '';
          return src.includes('item-shopping.c.yimg.jp');
        }).first().attr('src');
        
        if (found) {
          imageUrl = found;
          console.log(`  Found Image: ${imageUrl}`);
          
          // Update DB
          const { error: updateError } = await supabase
            .from('products')
            .update({ image: imageUrl })
            .eq('id', item.id);
            
          if (updateError) console.error("  Update Error:", updateError.message);
        } else {
          console.log("  No image found on Yahoo Shopping search page.");
        }
      } catch (e) {
        console.error(`  Scraping failed for ${item.name}:`, e.message);
      }
      
      // Delay
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
    }
    console.log("Test batch complete!");
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

fill();
