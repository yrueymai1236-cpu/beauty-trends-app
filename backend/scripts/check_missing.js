const supabase = require('../db/supabaseClient');

async function check() {
  try {
    const { data: nullImages, error: err1 } = await supabase
      .from('products')
      .select('id, name, brand')
      .is('image', null);
      
    const { data: emptyImages, error: err2 } = await supabase
      .from('products')
      .select('id, name, brand')
      .eq('image', '');

    if (err1 || err2) throw err1 || err2;

    console.log(`Products with NULL images: ${nullImages.length}`);
    console.log(`Products with EMPTY images: ${emptyImages.length}`);
    
    const allMissing = [...nullImages, ...emptyImages];
    console.log("Samples of missing images:");
    allMissing.slice(0, 10).forEach(p => {
      console.log(`  ID: ${p.id} | ${p.brand} ${p.name}`);
    });
  } catch (e) {
    console.error(e.message);
  }
}

check();
