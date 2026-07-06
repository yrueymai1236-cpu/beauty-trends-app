const supabase = require('../db/supabaseClient');

async function check() {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, likes')
      .order('likes', { ascending: false });

    const targetIndex = products.findIndex(p => p.name.toLowerCase().includes("malone") || p.name.includes("ウッド"));
    console.log("Jo Malone index (0-based) overall:", targetIndex);
    if (targetIndex !== -1) {
      const target = products[targetIndex];
      console.log("Jo Malone details:", target, "Calculated Rank:", targetIndex + 1);

      const { data: history } = await supabase
        .from('rank_history')
        .select('*')
        .eq('product_id', target.id)
        .order('recorded_date', { ascending: true });
        
      console.log("History in DB:", history);
    }
  } catch (e) {
    console.error(e);
  }
}
check();
