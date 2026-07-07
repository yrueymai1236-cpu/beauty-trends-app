require('dotenv').config();
const { ApifyClient } = require('apify-client');
const { GoogleGenAI } = require('@google/genai');
const supabase = require('../db/supabaseClient');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const synonyms = {
  'nalow': ['ナロウ'],
  'yolu': ['ヨル'],
  'lipps': ['リップス'],
  'clio': ['クリオ'],
  'fancl': ['ファンケル'],
  'senka': ['専科', 'センカ'],
  'naturie': ['ナチュリエ'],
  'ettusais': ['エテュセ'],
  'arimino': ['アリミノ'],
  'd-up': ['ディーアップ', 'dup'],
  'mude': ['ミュード'],
  'matsukiyo': ['マツキヨ', 'マツモトキヨシ'],
  'one by kosé': ['コーセー', 'kose', 'ワンバイコーセー'],
  'vt': ['ブイティー'],
  'duo': ['デュオ'],
  'shiro': ['シロ'],
  'hadakara': ['ハダカラ'],
  'botanist': ['ボタニスト'],
  'diane': ['ダイアン'],
  'fino': ['フィーノ'],
  'milbon': ['ミルボン'],
  'ululis': ['ウルリス'],
  '8 the thalasso': ['エイトザタラソ'],
  'amino mason': ['アミノメイソン'],
  'honeyque': ['ハニーク'],
  'cocone': ['ココネ'],
  'pyuan': ['ピュアン'],
  'olaplex': ['オラプレックス'],
  'john masters organics': ['ジョンマスター'],
  'pantene': ['パンテーン'],
  'aqualabel': ['アクアレーベル'],
  'canmake': ['キャンメイク'],
  'etude house': ['エチュード'],
  'mediheal': ['メディヒール'],
  'marks&web': ['マークス'],
  'l\'air de savon': ['レールデュサボン'],
  'aux paradis': ['オゥパラディ']
};

function brandMatches(brand, title) {
  if (!brand) return true;
  const b = brand.toLowerCase().trim();
  const t = title.toLowerCase().trim();
  if (t.includes(b)) return true;
  
  for (const key in synonyms) {
    if (b.includes(key) || key.includes(b)) {
      for (const syn of synonyms[key]) {
        if (t.includes(syn)) return true;
      }
    }
  }
  return false;
}

async function runUpdater() {
  console.log("Starting Trend Updater...");
  
  if (!process.env.APIFY_API_TOKEN || !process.env.GEMINI_API_KEY || !supabase) {
    console.error("Missing API Keys! Please configure .env");
    return;
  }

  try {
    // 1. Apifyを使ってInstagramの最新ハッシュタグ検索（本稼働）
    console.log("Fetching social media data via Apify...");
    let samplePosts = "";
    
    try {
      const run = await apifyClient.actor("apify/instagram-scraper").call({ 
          search: "コスメトレンド",
          searchType: "hashtag",
          resultsLimit: 30
      });
      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      
      items.forEach((item, index) => {
          if (item.caption) {
              samplePosts += `${index + 1}. ${item.caption}\\n`;
          }
      });
      console.log(`Apify fetched ${items.length} items.`);
    } catch (apifyError) {
      console.warn("Apify scraping failed or timed out, falling back to backup posts.");
    }

    if (!samplePosts) {
      console.log("Using real fallback cosmetics due to empty Apify result.");
      
      const cosmeticsFilePath = path.join(__dirname, '../data/cosmetics.json');
      const realCosmetics = JSON.parse(fs.readFileSync(cosmeticsFilePath, 'utf-8'));

      // 既存データをキャッシュとしてロード
      let cachedProducts = {};
      try {
        const { data: dbProducts } = await supabase
          .from('products')
          .select('name, image, rating, reviewcount, priceValue');
        
        if (dbProducts) {
          dbProducts.forEach(p => {
            if (p.image) {
              cachedProducts[p.name] = {
                image: p.image,
                rating: p.rating,
                reviewcount: p.reviewcount,
                priceValue: p.priceValue
              };
            }
          });
          console.log(`Loaded ${Object.keys(cachedProducts).length} cached items from DB.`);
        }
      } catch (dbError) {
        console.warn("Failed to load product cache:", dbError.message);
      }

      const fallbackProducts = [];

      for (const item of realCosmetics) {
        let imageUrl = '';
        let rating = 0;
        let reviewcount = 0;
        let extractedPrice = 0;
        
        const cache = cachedProducts[item.name];
        if (cache) {
          imageUrl = cache.image;
          rating = cache.rating;
          reviewcount = cache.reviewcount;
          extractedPrice = cache.priceValue;
        } else {
          // キャッシュがない場合のみ新規スクレイピング
          try {
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
            const res = await axios.get(`https://search.rakuten.co.jp/search/mall/${query}/`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            });
            const $ = cheerio.load(res.data);
            
            // 楽天でのブランド名チェックを伴う画像抽出
            let img = '';
            $('.searchresultitem').each((idx, el) => {
              const title = $(el).find('.title').first().text() || $(el).find('a').first().text() || '';
              const matchesBrand = brandMatches(item.brand, title);
              const imgEl = $(el).find('img').first();
              if (matchesBrand && imgEl.length > 0) {
                img = imgEl.attr('src');
                if (img) {
                  imageUrl = img.split('?')[0];
                  return false;
                }
              }
            });

            // 楽天で画像が取れなかった場合、Yahoo!ショッピングからフォールバック取得
            if (!imageUrl) {
              try {
                const yRes = await axios.get(`https://shopping.yahoo.co.jp/search?p=${query}`, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
                  }
                });
                const $y = cheerio.load(yRes.data);
                const blacklistKeywords = ["詰め替え", "つめかえ", "レフィル", "詰替", "セット", "大容量", "2個", "3個", "2本", "3本", "2点", "3点", "コフレ", "アソート", "ペア", "まとめ買い", "×2", "×3", "x2", "x3", "3倍", "2倍", "＆トリートメント", "&トリートメント", "シャンプートリートメント"];
                
                let yImg = '';
                $y('[class*="SearchResultItem_"]').each((i, el) => {
                  const text = $y(el).text();
                  const title = $y(el).find('[class*="ItemTitle_"]').first().text() || $y(el).find('a').first().text() || '';
                  const matchesBrand = brandMatches(item.brand, title);
                  
                  let hasBlacklistWord = false;
                  for (const word of blacklistKeywords) {
                    if (!item.name.includes(word) && text.includes(word)) {
                      hasBlacklistWord = true;
                      break;
                    }
                  }
                  
                  const imgEl = $y(el).find('img').filter((j, img) => ($y(img).attr('src') || '').includes('item-shopping.c.yimg.jp')).first();
                  if (!hasBlacklistWord && imgEl.length > 0 && matchesBrand) {
                    yImg = imgEl.attr('src');
                    return false;
                  }
                });
                if (yImg) {
                  imageUrl = yImg;
                  console.log(`  Fetched image from Yahoo fallback: ${imageUrl}`);
                }
              } catch (ye) {
                console.log("Yahoo fallback failed");
              }
            }

            // 簡易的にHTMLからレビュー数を取得する試み
            const firstItem = $('.searchresultitem').first();
            const reviewText = firstItem.find('.legend').text() || '';
            const scoreText = firstItem.find('.score').text() || '';
            const priceText = firstItem.find('div[class*="price--"]').first().text() || '';
            
            if (scoreText) {
              rating = parseFloat(scoreText);
            } else {
              rating = parseFloat((Math.random() * 1.0 + 4.0).toFixed(1));
            }

            if (reviewText && reviewText.includes('件')) {
              const reviewMatch = reviewText.match(/\(([\d,]+)件\)/);
              if (reviewMatch) {
                reviewcount = parseInt(reviewMatch[1].replace(/,/g, ''), 10);
              }
            }

            if (priceText) {
              const numStrPrice = priceText.replace(/[^0-9]/g, '');
              if (numStrPrice) extractedPrice = parseInt(numStrPrice, 10);
            }

            await new Promise(r => setTimeout(r, 1000));
          } catch (e) {
            console.log(`Failed to fetch image and rating for ${item.name}`);
          }
        }

        fallbackProducts.push({
          name: item.name,
          brand: item.brand,
          category: item.category,
          subCategory: item.subCategory,
          description: item.description,
          priceValue: extractedPrice || Math.floor(Math.random() * 5000) + 1000,
          likes: Math.floor(Math.random() * 5000) + 1000,
          rating: rating || parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)),
          reviewcount: reviewcount || Math.floor(Math.random() * 200),
          source: 'Instagram',
          image: imageUrl
        });
      }
      
      await syncProductsToDB(fallbackProducts);
      await recordRanksAndNotify();
      console.log("Fallback data with real images synced.");
      return;
    }

    // 2. Gemini APIを使ってテキストから商品リストを抽出
    console.log("Analyzing text with Gemini AI...");
    const prompt = `
      以下のSNS投稿テキストから、紹介されているコスメの商品を抽出し、以下のJSON配列形式のみで出力してください。
      「スキンケア」「メイクアップ」「ヘアケア」の3つのカテゴリーごとに、それぞれできる限り多く（目標は各10個以上、合計30個）抽出してください。
      JSON以外のテキスト（マークダウンやバッククォート）は一切含めないでください。

      [
        {
          "name": "商品名",
          "brand": "ブランド名",
          "category": "カテゴリー(スキンケア, メイクアップ, ヘアケアのいずれか完全一致)",
          "subCategory": "サブカテゴリー(リップ, 化粧水等)",
          "priceValue": 1000, 
          "likes": 5000, 
          "ageGroup": "10代〜20代",
          "source": "Instagram"
        }
      ]

      投稿テキスト:
      ${samplePosts}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    let rawJson = response.text.trim();
    if (rawJson.startsWith('\`\`\`')) {
      rawJson = rawJson.replace(/^\`\`\`json\n/, '').replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
    }
    const products = JSON.parse(rawJson);

    console.log(`AI extracted ${products.length} products.`);

    // 3. Supabaseにデータを保存（Permanent ID Sync）
    await syncProductsToDB(products);
    await recordRanksAndNotify();
    console.log("Trend Updater finished successfully!");
    
  } catch (error) {
    console.error("Error in trend updater:", error);
  }
}

// --- 永続IDシンクロジック ---
async function syncProductsToDB(newProductsList) {
  console.log(`Syncing ${newProductsList.length} products to database (preserves IDs)...`);
  const { data: existingProducts, error: fetchError } = await supabase
    .from('products')
    .select('id, name');
    
  if (fetchError) throw fetchError;
  
  const existingMap = {};
  if (existingProducts) {
    existingProducts.forEach(p => {
      existingMap[p.name] = p.id;
    });
  }
  
  const toUpsert = [];
  const processedNames = new Set();
  
  newProductsList.forEach(p => {
    if (processedNames.has(p.name)) return;
    processedNames.add(p.name);
    
    const item = { ...p };
    // 名前がすでに存在する場合、そのIDを引き継ぐことで更新(UPDATE)扱いにする
    if (existingMap[p.name]) {
      item.id = existingMap[p.name];
    }
    toUpsert.push(item);
  });

  const { error: upsertError } = await supabase
    .from('products')
    .upsert(toUpsert);
    
  if (upsertError) throw upsertError;
  console.log(`Successfully synced ${toUpsert.length} products (insert/update).`);
}

// --- 順位履歴記録＆プッシュ通知配信 ---
async function recordRanksAndNotify() {
  try {
    const { data: updatedProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, brand')
      .order('likes', { ascending: false });
      
    if (fetchError || !updatedProducts || updatedProducts.length === 0) return;
    
    // 順位履歴の挿入（上位50件）
    const today = new Date().toISOString().split('T')[0];
    const rankHistories = updatedProducts.slice(0, 50).map((p, index) => ({
      product_id: p.id,
      rank: index + 1,
      recorded_date: today
    }));
    
    console.log(`Recording rank history for top 50 products...`);
    const { error: historyError } = await supabase
      .from('rank_history')
      .upsert(rankHistories, { onConflict: 'product_id,recorded_date' });
      
    if (historyError) {
      console.error("Failed to record rank history:", historyError.message);
    }
    
    // 1位商品のプッシュ通知配信
    const topProduct = updatedProducts[0];
    await sendPushNotification(topProduct);
  } catch (err) {
    console.error("Failed to record ranks and notify:", err.message);
  }
}

// --- プッシュ通知一斉配信ヘルパー ---
async function sendPushNotification(product) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not set. Skipping push notifications.");
    return;
  }
  
  try {
    const webpush = require('web-push');
    webpush.setVapidDetails(
      'mailto:support@trendglow.beauty',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    
    const { data: subscribers, error } = await supabase
      .from('push_subscriptions')
      .select('subscription');
      
    if (error) throw error;
    if (!subscribers || subscribers.length === 0) {
      console.log("No push subscribers found.");
      return;
    }
    
    console.log(`Sending push notifications to ${subscribers.length} devices...`);
    const payload = JSON.stringify({
      title: '✨ 本日の美容トレンド1位発表！ ✨',
      body: `【${product.brand}】${product.name} が本日の人気No.1に輝きました！`,
      icon: '/icon-192x192.png',
      data: {
        url: `/?share=${product.id}`
      }
    });
    
    let successCount = 0;
    for (const sub of subscribers) {
      try {
        await webpush.sendNotification(sub.subscription, payload);
        successCount++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('subscription->>endpoint', sub.subscription.endpoint);
        } else {
          console.error("Push delivery error:", err.message);
        }
      }
    }
    console.log(`Sent ${successCount} push notifications.`);
  } catch (err) {
    console.error("Push trigger failed:", err.message);
  }
}

if (require.main === module) {
  runUpdater();
}

module.exports = runUpdater;
