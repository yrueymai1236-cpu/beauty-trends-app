const supabase = require('../db/supabaseClient');

async function inspect() {
  console.log("Checking DB products...");
  try {
    const { data, error } = await supabase.from('products').select('id, name, image').limit(20);
    if (error) throw error;
    
    console.log(`Fetched ${data.length} items.`);
    data.forEach(item => {
      console.log(`ID: ${item.id} | Name: ${item.name} | Image: "${item.image}"`);
    });
  } catch (e) {
    console.error("Failed to inspect DB:", e.message);
  }
}

inspect();
