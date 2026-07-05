const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeYahoo(queryStr) {
  const query = encodeURIComponent(queryStr);
  try {
    const res = await axios.get(`https://shopping.yahoo.co.jp/search?p=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
      }
    });
    const $ = cheerio.load(res.data);
    
    let item = null;
    $('[class*="SearchResultItem_"]').each((i, el) => {
      if ($(el).find('img').filter((j, imgEl) => ($(imgEl).attr('src') || '').includes('item-shopping.c.yimg.jp')).length > 0) {
        item = $(el);
        return false;
      }
    });
    
    if (!item) return null;
    
    const image = item.find('img').filter((i, el) => ($(el).attr('src') || '').includes('item-shopping.c.yimg.jp')).first().attr('src') || '';
    
    // Price fix: use .first()
    const priceText = item.find('[class*="ItemPrice_ItemPrice__"]').first().text() || item.find('[class*="Price"]').first().text() || '';
    const numPrice = priceText.replace(/[^0-9]/g, '');
    const priceValue = numPrice ? parseInt(numPrice, 10) : 0;
    
    const ariaLabel = item.find('.Review__stars').first().attr('aria-label') || '';
    const ratingMatch = ariaLabel.match(/5点中([\d\.]+)点の評価/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
    
    const reviewText = item.find('[class*="Review__count"]').first().text() || '';
    const reviewMatch = reviewText.match(/（([\d,]+)件）/);
    const reviewcount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ''), 10) : 0;
    
    return {
      query: queryStr,
      image,
      priceValue,
      rating,
      reviewcount
    };
  } catch (e) {
    return null;
  }
}

async function test() {
  const products = [
    'DUO ザ クレンジングバーム',
    'ファンケル マイルドクレンジング オイル',
    'アテニア スキンクリア クレンズ オイル アロマタイプ',
    '無印良品 マイルドオイルクレンジング'
  ];
  
  for (const p of products) {
    const res = await scrapeYahoo(p);
    console.log("Result:", res);
    await new Promise(r => setTimeout(r, 1000));
  }
}

test();
