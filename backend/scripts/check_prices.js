const supabase = require('../db/supabaseClient');

async function check() {
  try {
    const { data, error } = await supabase.from('products').select('id, name, priceValue, rating, reviewcount');
    if (error) throw error;
    
    console.log(`Total items in DB: ${data.length}`);
    const zeroPrice = data.filter(item => !item.priceValue || item.priceValue === 0);
    console.log(`Items with 0 or null price: ${zeroPrice.length}`);
    
    if (data.length > 0) {
      console.log("Sample items:");
      data.slice(0, 10).forEach(item => {
        console.log(`ID: ${item.id} | Name: ${item.name} | Price: ${item.priceValue} | Rating: ${item.rating} | Reviews: ${item.reviewcount}`);
      });
    }
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

check();
