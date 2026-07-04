require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const outputPath = path.join(__dirname, '../data/cosmetics.json');

const batches = [
  { category: 'スキンケア', subcategories: '化粧水, 乳液, 美容液, クリーム, パック', count: 150 },
  { category: 'スキンケア', subcategories: 'クレンジング, 洗顔料, 日焼け止め, アイケア', count: 150 },
  { category: 'メイクアップ', subcategories: 'リップ, 口紅, リップグロス, リップティント', count: 150 },
  { category: 'メイクアップ', subcategories: 'アイシャドウ, マスカラ, アイライナー, アイブロウ', count: 150 },
  { category: 'メイクアップ', subcategories: 'ファンデーション, 化粧下地, フェイスパウダー, コンシーラー', count: 100 },
  { category: 'ヘアケア', subcategories: 'シャンプー, トリートメント, ヘアオイル, ヘアミルク, スタイリング剤', count: 150 },
  { category: 'ボディケア', subcategories: 'ボディソープ, ボディクリーム, ハンドクリーム, 入浴剤', count: 100 },
  { category: 'フレグランス', subcategories: '香水, オーデコロン, ヘアフレグランス', count: 50 },
];

async function generateAll() {
  console.log("Starting real 1000 SNS trend items generation...");
  const allProducts = [];
  const existingNames = new Set();

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Generating Batch ${i + 1}/${batches.length}: ${batch.category} (${batch.subcategories}) - target ${batch.count} items...`);
    
    const prompt = `
      あなたは日本の美容トレンド・コスメティックの専門家です。
      日本のInstagram、TikTok、LIPSなどのSNSで現在または近年非常にバズった、あるいは定番人気となっているリアルなコスメ商品を、重複なく【${batch.count}個】リストアップしてください。
      
      カテゴリー: ${batch.category}
      主なサブカテゴリー対象: ${batch.subcategories}
      
      以下のルールを厳守してください：
      1. すべて実在するブランドの実在する商品にしてください。
      2. 以下の既存の商品名リストに含まれるものは絶対に含めないでください（完全に重複を避けるため）：
         ${Array.from(existingNames).slice(-200).join(', ')}
      3. 出力は以下のJSON配列形式のみとし、マークダウンの\`\`\`jsonなどの装飾テキストや説明は一切含めないでください。
      
      [
        {
          "name": "商品名（日本のSNSで呼ばれている一般的な名称）",
          "brand": "ブランド名",
          "category": "${batch.category}",
          "subCategory": "サブカテゴリー名（リップ、化粧水など）",
          "description": "なぜInstagramやSNSで人気なのか、その魅力を日本語で2文以内で簡潔に説明"
        }
      ]
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let rawJson = response.text.trim();
      if (rawJson.startsWith('```')) {
        rawJson = rawJson.replace(/^\`\`\`json\n/, '').replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
      }
      
      const parsed = JSON.parse(rawJson);
      let added = 0;
      for (const item of parsed) {
        if (!existingNames.has(item.name)) {
          existingNames.add(item.name);
          allProducts.push(item);
          added++;
        }
      }
      console.log(`Batch ${i + 1} complete. Successfully added ${added} unique items. Total so far: ${allProducts.length}`);
      
      // APIレート制限対策
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.error(`Error in batch ${i + 1}:`, e.message);
      // エラーが起きた場合は少し待ってリトライ、またはスキップ
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log(`Generation finished. Total unique products generated: ${allProducts.length}`);
  
  // ファイルに書き出し
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2), 'utf-8');
  console.log(`Saved to ${outputPath}`);
}

generateAll();
