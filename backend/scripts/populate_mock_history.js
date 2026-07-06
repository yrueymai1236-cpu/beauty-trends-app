const supabase = require('../db/supabaseClient');

async function populate() {
  console.log("Starting mock rank history generator...");
  try {
    // 1. Get the top 100 products by likes
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, brand')
      .order('likes', { ascending: false })
      .limit(100);
      
    if (fetchError) throw fetchError;
    console.log(`Found ${products.length} products to generate mock history.`);

    const today = new Date();
    const rankHistories = [];

    // For each product, generate 7 days of historical ranks (from 6 days ago to today)
    products.forEach((p, index) => {
      const currentRank = index + 1;
      
      // Let's create a trend: some go up, some go down, some fluctuate
      const trendType = index % 3; // 0 = rising, 1 = falling, 2 = fluctuating
      
      for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
        const date = new Date(today);
        date.setDate(today.getDate() - dayOffset);
        const dateStr = date.toISOString().split('T')[0];
        
        let mockRank = currentRank;
        
        // Calculate mock rank based on day offset and trend type
        if (trendType === 0) {
          // Rising trend: ranks were larger (worse) in the past
          mockRank = currentRank + (6 - dayOffset) * (Math.floor(Math.random() * 2) + 1);
        } else if (trendType === 1) {
          // Falling trend: ranks were smaller (better) in the past
          mockRank = currentRank - (6 - dayOffset) * (Math.floor(Math.random() * 2) + 1);
        } else {
          // Fluctuating: random variation
          mockRank = currentRank + Math.floor(Math.random() * 6 - 3);
        }
        
        // Clamp rank to a minimum of 1
        if (mockRank < 1) mockRank = 1;
        
        rankHistories.push({
          product_id: p.id,
          rank: mockRank,
          recorded_date: dateStr
        });
      }
    });

    console.log(`Inserting ${rankHistories.length} historical records into rank_history table...`);
    
    // Supabase upsert
    const { error: upsertError } = await supabase
      .from('rank_history')
      .upsert(rankHistories, { onConflict: 'product_id,recorded_date' });
      
    if (upsertError) throw upsertError;
    
    console.log("Mock rank history generated and inserted successfully!");
  } catch (e) {
    console.error("Failed to generate mock rank history:", e.message);
    console.log("\n⚠️ NOTE: If you haven't run the SQL DDL commands in Supabase SQL Editor yet, the table 'rank_history' does not exist yet. Please run the SQL commands in the Supabase Dashboard first!");
  }
}

populate();
