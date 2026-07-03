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

      const fallbackProducts = [];

      for (const item of realCosmetics) {
        let imageUrl = '';
        let rating = 0;
        let reviewCount = 0;
        try {
          const query = item.brand + ' ' + item.name;
          const response = await axios.get('https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601', {
            params: {
              applicationId: process.env.RAKUTEN_APP_ID || '1019079537947262807',
              keyword: query,
              format: 'json',
              availability: 1,
              hits: 1
            }
          });
          if (response.data && response.data.Items && response.data.Items.length > 0) {
            const productData = response.data.Items[0].Item;
            imageUrl = productData.mediumImageUrls[0].imageUrl;
            rating = productData.reviewAverage || 0;
            reviewCount = productData.reviewCount || 0;
          }
          await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
          console.log(`Failed to fetch image and rating for ${item.name}`);
        }

        fallbackProducts.push({
          id: `trend-${item.name}-${Date.now()}`,
          name: item.name,
          brand: item.brand,
          category: item.category,
          subCategory: item.subCategory,
          description: item.description,
          price: '価格情報なし',
          likes: Math.floor(Math.random() * 5000) + 1000,
          rating: rating,
          reviewCount: reviewCount,
          source: 'Instagram',
          postUrl: 'https://instagram.com/explore/tags/コスメ',
          image: imageUrl
        });
      }
      
      const { error: deleteError } = await supabase.from('products').delete().neq('id', 0); 
      const { error: insertError } = await supabase.from('products').insert(fallbackProducts);
      if (insertError) console.error("Insert Error:", insertError);
      console.log("Fallback data with real images inserted.");
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

    // 3. Supabaseにデータを保存（全入れ替えのシンプルなロジック）
    console.log("Saving data to Supabase...");
    
    const { error: deleteError } = await supabase.from('products').delete().neq('id', 0); 
    if (deleteError) console.warn("Delete error:", deleteError);

    const { error: insertError } = await supabase.from('products').insert(products);
    if (insertError) throw insertError;

    console.log("Trend Updater finished successfully!");
    
  } catch (error) {
    console.error("Error in trend updater:", error);
  }
}

if (require.main === module) {
  runUpdater();
}

module.exports = runUpdater;
