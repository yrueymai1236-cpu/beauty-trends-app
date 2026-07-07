const supabase = require('../db/supabaseClient');

async function fix() {
  try {
    const { error: err1 } = await supabase
      .from('products')
      .update({
        priceValue: 1980,
        image: "/nalow_shampoo.jpg"
      })
      .eq('id', 3359);

    const { error: err2 } = await supabase
      .from('products')
      .update({
        priceValue: 1980,
        image: "/nalow_treatment.jpg"
      })
      .eq('id', 3360);

    if (err1 || err2) throw err1 || err2;

    console.log("Successfully fixed NALOW Shampoo and Treatment records in database!");
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

fix();
