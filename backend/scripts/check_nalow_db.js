const supabase = require('../db/supabaseClient');

async function check() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .ilike('brand', '%NALOW%');

    if (error) throw error;
    
    console.log(`Found ${products.length} NALOW products in DB:`);
    products.forEach(p => {
      console.log(`ID: ${p.id}`);
      console.log(`Name: ${p.brand} ${p.name}`);
      console.log(`Price: ¥${p.priceValue}`);
      console.log(`Image: ${p.image}`);
    });
  } catch (e) {
    console.error(e.message);
  }
}

check();
