const { image_search } = require('duckduckgo-images-api');

async function test() {
  console.log("Searching image on DuckDuckGo...");
  try {
    const results = await image_search({ query: 'DUO ザ クレンジングバーム', moderate: true });
    console.log(`Found ${results.length} images.`);
    if (results.length > 0) {
      console.log("First image URL:", results[0].image);
    }
  } catch (e) {
    console.error("DDG search failed:", e.message);
  }
}

test();
