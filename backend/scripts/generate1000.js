const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../data/cosmetics.json');
const realCosmetics = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

const suffixes = [
  "",
  " (限定カラー)",
  " トラベルサイズ",
  " 大容量ポンプ",
  " (海外パッケージ)",
  " プレミアム版",
  " ギフトセット",
  " 詰め替え用",
  " (春の新作)",
  " (リニューアル版)",
];

const newCosmetics = [];

for (let i = 0; i < 10; i++) {
  for (const item of realCosmetics) {
    if (newCosmetics.length >= 1000) break;
    newCosmetics.push({
      ...item,
      name: `${item.name}${suffixes[i] || " (バリエーション" + i + ")"}`,
    });
  }
}

fs.writeFileSync(inputPath, JSON.stringify(newCosmetics, null, 2), 'utf-8');
console.log(`Successfully generated ${newCosmetics.length} items in cosmetics.json!`);
