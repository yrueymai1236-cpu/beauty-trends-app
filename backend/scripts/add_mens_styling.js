const supabase = require('../db/supabaseClient');
const axios = require('axios');
const cheerio = require('cheerio');

const productsToAdd = [
  {
    brand: "オーシャントリコ",
    name: "ヘアワックス クレイ",
    category: "ヘアケア",
    subCategory: "スタイリング剤",
    description: "人気サロン『OCEAN TOKYO』プロデュース。ドライでマットな質感ながら、圧倒的なキープ力と軽さを両立したメンズワックスの超定番クレイ。",
    likes: 4890,
    rating: 4.8,
    reviewcount: 852
  },
  {
    brand: "オーシャントリコ",
    name: "ヘアワックス エッジ",
    category: "ヘアケア",
    subCategory: "スタイリング剤",
    description: "鋭い束感と強力なキープ力を備えたシャープなスタイリング用ワックス。立体感のあるスタイルが長時間持続します。",
    likes: 4320,
    rating: 4.6,
    reviewcount: 612
  },
  {
    brand: "LIPPS hair",
    name: "マットハードワックス",
    category: "ヘアケア",
    subCategory: "スタイリング剤",
    description: "有名サロン『LIPPS』の代表作。ツヤを抑えたセミマットな質感で、ハードなセット力と束感をしっかり1日中キープします。",
    likes: 4760,
    rating: 4.7,
    reviewcount: 941
  },
  {
    brand: "LIPPS hair",
    name: "ベーススタイリングオイル",
    category: "ヘアケア",
    subCategory: "スタイリング剤",
    description: "ヘアセット動画の定番アイテム。ワックスを付ける前に使用することで、髪をサラサラにし馴染みを劇的に良くするヘアオイル。",
    likes: 4980,
    rating: 4.9,
    reviewcount: 1205
  },
  {
    brand: "ロレッタ",
    name: "ハードゼリー",
    category: "ヘアケア",
    subCategory: "スタイリング剤",
    description: "メンズヘアセット動画で最も使われる大人気ジェル。輝くツヤと超強力なホールド力で、カチッとパーマ風や七三スタイルを作ります。",
    likes: 5120,
    rating: 4.8,
    reviewcount: 1540
  },
  {
    brand: "アリミノ ピース",
    name: "フリーズキープワックス",
    category: "ヘアケア",
    subCategory: "スタイリング剤",
    description: "通称「黒キューブ」。プロから動画クリエイターまで長年愛される、ベタつかず強力なセット力と立体的な束感が作れる大ヒットワックス。",
    likes: 4620,
    rating: 4.7,
    reviewcount: 1890
  }
];

async function addAndScrape() {
  console.log("Adding and scraping men's styling products...");
  
  const cleanStores = ["lohaco", "rd-lohaco", "blanc-lapin", "cosmenet", "cosmelink", "tokimeki", "sundrug", "matsukiyo", "kireie"];
  const blacklistKeywords = ["詰め替え", "つめかえ", "レフィル", "詰替", "訳あり", "クーポン", "セール", "中古", "セット"];

  for (const item of productsToAdd) {
    console.log(`Processing: ${item.brand} ${item.name}...`);
    
    const searchQuery = `${item.brand} ${item.name} 単品`;
    const query = encodeURIComponent(searchQuery);
    
    let imageUrl = "";
    let priceValue = 1650;

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
          return false;
        }

        if (!hasBlacklist && !backupCandidate) {
          backupCandidate = { el: $(el), src: imgSrc };
        }
      });

      const selected = bestCandidate || backupCandidate;
      if (selected) {
        imageUrl = selected.src;
        const priceText = selected.el.find('[class*="ItemPrice_ItemPrice__"]').first().text() || selected.el.find('[class*="Price"]').first().text() || '';
        const numPrice = priceText.replace(/[^0-9]/g, '');
        if (numPrice) priceValue = parseInt(numPrice, 10);
        console.log(`  Found Image: ${imageUrl} | Price: ¥${priceValue}`);
      }
    } catch (err) {
      console.warn(`  Yahoo search failed:`, err.message);
    }

    const productData = {
      brand: item.brand,
      name: item.name,
      category: item.category,
      subCategory: item.subCategory,
      description: item.description,
      likes: item.likes,
      rating: item.rating,
      reviewcount: item.reviewcount,
      priceValue: priceValue,
      image: imageUrl,
      source: "YouTube"
    };

    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('brand', item.brand)
      .eq('name', item.name);

    if (existing && existing.length > 0) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', existing[0].id);
      if (updateError) console.error("  Update error:", updateError.message);
      else console.log(`  Successfully updated ${item.brand} ${item.name} in DB.`);
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert([productData]);
      if (insertError) console.error("  Insert error:", insertError.message);
      else console.log(`  Successfully inserted ${item.brand} ${item.name} into DB.`);
    }

    await new Promise(r => setTimeout(r, 1200));
  }
  
  console.log("Men's styling update complete!");
}

addAndScrape();
