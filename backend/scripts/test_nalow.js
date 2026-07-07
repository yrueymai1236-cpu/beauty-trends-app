const axios = require('axios');
const cheerio = require('cheerio');

function brandMatches(brand, title) {
  if (!brand) return true;
  const b = brand.toLowerCase().trim();
  const t = title.toLowerCase().trim();
  if (t.includes(b)) return true;
  
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
  
  for (const key in synonyms) {
    if (b.includes(key) || key.includes(b)) {
      for (const syn of synonyms[key]) {
        if (t.includes(syn)) return true;
      }
    }
  }
  return false;
}

async function test() {
  const query = encodeURIComponent('ナロウ シャンプー');
  try {
    const res = await axios.get(`https://shopping.yahoo.co.jp/search?p=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
      }
    });
    console.log(`Response status: ${res.status}, Length: ${res.data.length}`);
    const $ = cheerio.load(res.data);
    
    console.log("Search results for NALOW shampoo:");
    
    // Print all div classes that start with SearchResultItem
    let count = 0;
    $('div').each((i, el) => {
      const cls = $(el).attr('class') || '';
      if (cls.includes('SearchResultItem') || cls.includes('Item')) {
        count++;
        if (count < 10) {
          console.log(`Found matching div class: "${cls}"`);
        }
      }
    });
    console.log(`Total matching divs: ${count}`);
    console.log("Searching for title elements:");
    $('*').each((i, el) => {
      const cls = $(el).attr('class') || '';
      if (cls.toLowerCase().includes('title') || cls.toLowerCase().includes('price')) {
        const text = $(el).text().trim();
        if (text && text.length > 5 && text.length < 150) {
          console.log(`Class: "${cls}" | Text: "${text.substring(0, 100)}"`);
        }
      }
    });
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

test();
