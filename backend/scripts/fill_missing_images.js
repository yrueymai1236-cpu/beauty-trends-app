const supabase = require('../db/supabaseClient');
const axios = require('axios');
const cheerio = require('cheerio');

async function fillMissing() {
  console.log("Starting missing image recovery script...");
  try {
    // Get all products with empty image
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, brand')
      .eq('image', '')
      .order('id', { ascending: true });

    if (error) throw error;
    console.log(`Found ${products.length} products with missing images.`);

    const cleanStores = ["lohaco", "rd-lohaco", "blanc-lapin", "cosmenet", "cosmelink", "tokimeki", "sundrug", "matsukiyo", "kireie", "wellness", "ladydrug", "drug", "chemist"];
    const blacklistKeywords = ["詰め替え", "つめかえ", "レフィル", "詰替", "訳あり", "クーポン", "セール", "おまけ", "ジャンク", "中古", "セット", "大容量", "コフレ"];

    let fixCount = 0;

    for (const item of products) {
      // Simplify search query
      let cleanName = item.name
        .replace(/\(リニューアル\)/g, '')
        .replace(/（リニューアル）/g, '')
        .replace(/\(携帯用\)/g, '')
        .replace(/for ボリューム/g, '')
        .replace(/ミニ/g, '')
        .replace(/2\.0/g, '')
        .replace(/1\.0/g, '')
        .replace(/ N$/g, '')
        .trim();

      let searchQuery = `${item.brand} ${cleanName}`;
      if (item.name.includes("シャンプー") || item.name.includes("トリートメント") || item.name.includes("ボディソープ") || item.name.includes("コンディショナー")) {
        searchQuery += " ポンプ 単品";
      } else if (item.name.includes("クレンジング") || item.name.includes("洗顔")) {
        searchQuery += " 本体 単品";
      }

      console.log(`Processing: ${item.brand} ${item.name} -> Query: ${searchQuery}`);
      const query = encodeURIComponent(searchQuery);

      let foundImage = "";
      let foundPrice = 0;

      // 1. Try Yahoo Shopping
      try {
        const res = await axios.get(`https://shopping.yahoo.co.jp/search?p=${query}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
          }
        });
        const $ = cheerio.load(res.data);

        let bestCandidate = null;
        let backupCandidate = null;

        $('[class*="SearchResultItem_"]').each((i, el) => {
          const text = $(el).text();
          const imgEl = $(el).find('img').filter((j, img) => ($(img).attr('src') || '').includes('item-shopping.c.yimg.jp')).first();
          
          if (imgEl.length === 0) return;
          const imgSrc = imgEl.attr('src') || '';

          const isCleanStore = cleanStores.some(store => imgSrc.includes(store) || text.toLowerCase().includes(store));
          const hasBlacklist = blacklistKeywords.some(word => !item.name.includes(word) && text.includes(word));

          if (isCleanStore && !hasBlacklist) {
            bestCandidate = { el: $(el), src: imgSrc };
            return false; // Found perfect LOHACO/drugstore image!
          }

          if (!hasBlacklist && !backupCandidate) {
            backupCandidate = { el: $(el), src: imgSrc };
          }
        });

        const selected = bestCandidate || backupCandidate;
        if (selected) {
          foundImage = selected.src;
          const priceText = selected.el.find('[class*="ItemPrice_ItemPrice__"]').first().text() || selected.el.find('[class*="Price"]').first().text() || '';
          const numPrice = priceText.replace(/[^0-9]/g, '');
          foundPrice = numPrice ? parseInt(numPrice, 10) : 0;
          console.log(`  [Yahoo] Found image: ${foundImage} | Price: ¥${foundPrice}`);
        }
      } catch (yahooErr) {
        console.warn(`  [Yahoo] Search failed:`, yahooErr.message);
      }

      // 2. Try Rakuten (Fallback)
      if (!foundImage) {
        try {
          const rakQuery = encodeURIComponent(`${item.brand} ${cleanName}`);
          const res = await axios.get(`https://search.rakuten.co.jp/search/mall/${rakQuery}/`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          const $ = cheerio.load(res.data);
          let img = $('.searchresultitem img').first().attr('src');
          if (img) {
            foundImage = img.split('?')[0];
            const priceText = $('.searchresultitem').first().find('div[class*="price--"]').first().text() || '';
            const numStrPrice = priceText.replace(/[^0-9]/g, '');
            foundPrice = numStrPrice ? parseInt(numStrPrice, 10) : 0;
            console.log(`  [Rakuten] Found image: ${foundImage} | Price: ¥${foundPrice}`);
          }
        } catch (rakErr) {
          console.warn(`  [Rakuten] Search failed:`, rakErr.message);
        }
      }

      // 3. Update Supabase
      if (foundImage) {
        const updateData = { image: foundImage };
        if (foundPrice > 0) {
          updateData.priceValue = foundPrice;
        }

        const { error: updateErr } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', item.id);

        if (updateErr) {
          console.error(`  Update failed for ID ${item.id}:`, updateErr.message);
        } else {
          console.log(`  Successfully fixed image for ID ${item.id}!`);
          fixCount++;
        }
      } else {
        console.log(`  Failed to retrieve image for: ${item.brand} ${item.name}`);
      }

      // Respectful delay
      await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    }

    console.log(`Cleanup complete! Successfully updated ${fixCount} products.`);
  } catch (e) {
    console.error("Script failed:", e.message);
  }
}

fillMissing();
