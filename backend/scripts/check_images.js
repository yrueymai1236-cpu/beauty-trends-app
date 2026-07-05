const supabase = require('../db/supabaseClient');

async function check() {
  try {
    const { data, error } = await supabase.from('products').select('id, name, image');
    if (error) throw error;
    
    const withImage = data.filter(item => item.image && item.image.length > 0);
    console.log(`Total items in DB: ${data.length}`);
    console.log(`Items with image: ${withImage.length}`);
    
    if (withImage.length > 0) {
      console.log("Sample with image:", withImage[0]);
    }
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

check();
