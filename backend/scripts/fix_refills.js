const supabase = require('../db/supabaseClient');
const axios = require('axios');
const cheerio = require('cheerio');

async function fixRefills() {
  console.log("Starting upgraded refill & set cleanup script...");
  try {
    // 1. Fetch products that match typical refill categories/names
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, brand, category, priceValue, image, rating, reviewcount')
      .or('name.ilike.%シャンプー%,name.ilike.%トリートメント%,name.ilike.%ボディソープ%,name.ilike.%ヘアマスク%,name.ilike.%コンディショナー%,name.ilike.%クレンジング%,name.ilike.%洗顔%')
      .order('id', { ascending: true });

    if (error) throw error;
    console.log(`Found ${products.length} candidate products to inspect for refills/sets.`);

    const blacklistKeywords = ["詰め替え", "つめかえ", "レフィル", "詰替", "セット", "大容量", "2個", "3個", "2本", "3本", "2点", "3点", "コフレ", "アソート", "ペア", "まとめ買い", "×2", "×3", "x2", "x3", "3倍", "2倍", "＆トリートメント", "&トリートメント", "シャンプートリートメント"];

    let fixCount = 0;

    for (const item of products) {
      console.log(`Inspecting: ${item.brand} ${item.name} (Current Price: ¥${item.priceValue})`);

      // Determine the specific target suffix to query for a single main item
      let searchQuery = `${item.brand} ${item.name}`;
      const isShampooOrSimilar = item.name.includes("シャンプー") || item.name.includes("トリートメント") || item.name.includes("ボディソープ") || item.name.includes("コンディショナー");
      const isCleanserOrWash = item.name.includes("クレンジング") || item.name.includes("洗顔");

      if (isShampooOrSimilar) {
        if (!item.name.includes("本体") && !item.name.includes("ボトル") && !item.name.includes("ポンプ")) {
          searchQuery += " ポンプ 単品";
        }
      } else if (isCleanserOrWash) {
        if (!item.name.includes("本体") && !item.name.includes("ボトル")) {
          searchQuery += " 本体 単品";
        }
      }

      const query = encodeURIComponent(searchQuery);

      try {
        const res = await axios.get(`https://shopping.yahoo.co.jp/search?p=${query}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
          }
        });
        const $ = cheerio.load(res.data);
        
        let selectedItemEl = null;
        let selectedTitle = "";

        $('[class*="SearchResultItem_"]').each((i, el) => {
          const text = $(el).text();
          const title = $(el).find('[class*="ItemTitle_"]').first().text() || $(el).find('a').first().text() || '';
          
          let hasBlacklistWord = false;
          for (const word of blacklistKeywords) {
            // Only blacklist if the word is NOT in the product's original name
            if (!item.name.includes(word) && text.includes(word)) {
              hasBlacklistWord = true;
              break;
            }
          }

          const hasImage = $(el).find('img').filter((j, imgEl) => ($(imgEl).attr('src') || '').includes('item-shopping.c.yimg.jp')).length > 0;

          if (!hasBlacklistWord && hasImage) {
            selectedItemEl = $(el);
            selectedTitle = title;
            return false; // Found the best single unit result!
          }
        });

        if (selectedItemEl) {
          const newImage = selectedItemEl.find('img').filter((j, imgEl) => ($(imgEl).attr('src') || '').includes('item-shopping.c.yimg.jp')).first().attr('src') || '';
          const priceText = selectedItemEl.find('[class*="ItemPrice_ItemPrice__"]').first().text() || selectedItemEl.find('[class*="Price"]').first().text() || '';
          const numPrice = priceText.replace(/[^0-9]/g, '');
          const newPrice = numPrice ? parseInt(numPrice, 10) : 0;

          const ariaLabel = selectedItemEl.find('.Review__stars').first().attr('aria-label') || '';
          const ratingMatch = ariaLabel.match(/5点中([\d\.]+)点の評価/);
          const newRating = ratingMatch ? parseFloat(ratingMatch[1]) : item.rating;

          const reviewText = selectedItemEl.find('[class*="Review__count"]').first().text() || '';
          const reviewMatch = reviewText.match(/（([\d,]+)件）/);
          const newReviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ''), 10) : item.reviewcount;

          console.log(`  Candidate Found: "${selectedTitle.trim().substring(0, 50)}..."`);
          console.log(`  New Price: ¥${newPrice} (Old: ¥${item.priceValue})`);

          if (newPrice > 0 && (newPrice !== item.priceValue || newImage !== item.image)) {
            const updateData = {
              priceValue: newPrice,
              rating: newRating || 4.5,
              reviewcount: newReviewCount || 50
            };
            if (newImage) updateData.image = newImage;

            const { error: updateError } = await supabase
              .from('products')
              .update(updateData)
              .eq('id', item.id);

            if (updateError) {
              console.error(`  Update failed for ID ${item.id}:`, updateError.message);
            } else {
              console.log(`  Successfully fixed ID ${item.id}!`);
              fixCount++;
            }
          } else {
            console.log(`  Price/Image unchanged or invalid.`);
          }
        } else {
          console.log(`  Could not find non-refill unit for "${searchQuery}".`);
        }
      } catch (err) {
        console.error(`  Scraping failed for ${item.name}:`, err.message);
      }

      // Delay to respect rate limits
      await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    }

    console.log(`Cleanup complete! Successfully fixed ${fixCount} products.`);
  } catch (e) {
    console.error("Script failed:", e.message);
  }
}

fixRefills();
