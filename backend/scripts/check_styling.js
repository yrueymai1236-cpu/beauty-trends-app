const supabase = require('../db/supabaseClient');

async function check() {
  try {
    const { data: ocean, error: err1 } = await supabase
      .from('products')
      .select('id, name, brand, category, priceValue')
      .ilike('brand', '%オーシャン%');
      
    const { data: lipps, error: err2 } = await supabase
      .from('products')
      .select('id, name, brand, category, priceValue')
      .ilike('brand', '%LIPPS%');
      
    const { data: arimino, error: err3 } = await supabase
      .from('products')
      .select('id, name, brand, category, priceValue')
      .ilike('brand', '%アリミノ%');

    if (err1 || err2 || err3) throw err1 || err2 || err3;

    console.log(`OCEAN TRICO products in DB: ${ocean.length}`);
    ocean.forEach(p => console.log(`  - ${p.brand} | ${p.name} (¥${p.priceValue})`));
    
    console.log(`LIPPS products in DB: ${lipps.length}`);
    lipps.forEach(p => console.log(`  - ${p.brand} | ${p.name} (¥${p.priceValue})`));

    console.log(`ARIMINO products in DB: ${arimino.length}`);
    arimino.forEach(p => console.log(`  - ${p.brand} | ${p.name} (¥${p.priceValue})`));
  } catch (e) {
    console.error(e.message);
  }
}

check();
