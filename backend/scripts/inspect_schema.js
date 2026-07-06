const supabase = require('../db/supabaseClient');

async function inspect() {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) throw error;
    if (data.length > 0) {
      console.log("Columns in 'products' table:", Object.keys(data[0]));
      console.log("Sample product details:", data[0]);
    } else {
      console.log("No data found.");
    }
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

inspect();
