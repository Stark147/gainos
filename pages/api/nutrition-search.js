// pages/api/nutrition-search.js
// Combines USDA FoodData Central + Open Food Facts for maximum coverage

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { query, source } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: 'No query' });

  const USDA_MAP = {
    1008:'cal',1003:'protein',1005:'carbs',1004:'fat',1079:'fiber',
    2000:'sugar',1093:'sodium',1092:'potassium',1087:'calcium',1089:'iron',
    1162:'vitC',1114:'vitD',1178:'vitB12',1090:'magnesium',1095:'zinc',
    1404:'omega3',1106:'vitA',1177:'folate',1253:'cholesterol',1258:'satFat',
  };

  try {
    let foods = [];

    // ── USDA Search ──────────────────────────────────────────
    if (source === 'usda' || source === 'all') {
      try {
        const r = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS),Branded&pageSize=20&api_key=${process.env.USDA_API_KEY || 'DEMO_KEY'}`
        );
        const d = await r.json();
        const usdaFoods = (d.foods || []).map(f => {
          const n = {};
          (f.foodNutrients || []).forEach(x => {
            const k = USDA_MAP[x.nutrientId];
            if (k) n[k] = Math.round((x.value || 0) * 10) / 10;
          });
          return {
            name: f.description,
            brand: f.brandOwner || '',
            category: f.foodCategory || 'USDA',
            serving: f.servingSize ? `${f.servingSize}${f.servingSizeUnit || 'g'}` : '100g',
            source: 'usda',
            fdcId: f.fdcId,
            ...n,
          };
        });
        foods = [...foods, ...usdaFoods];
      } catch(e) { console.error('USDA error:', e); }
    }

    // ── Open Food Facts Search ───────────────────────────────
    if (source === 'off' || source === 'all') {
      try {
        const r = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,brands,serving_size,nutriments,categories_tags,image_small_url`
        );
        const d = await r.json();
        const offFoods = (d.products || [])
          .filter(p => p.product_name && p.nutriments?.energy_100g)
          .map(p => {
            const n = p.nutriments || {};
            // Open Food Facts gives per 100g — we use that as base
            return {
              name: p.product_name,
              brand: p.brands || '',
              category: 'Packaged Food',
              serving: p.serving_size || '100g',
              source: 'off',
              cal:      Math.round((n['energy-kcal_100g'] || n['energy_100g'] / 4.184 || 0) * 10) / 10,
              protein:  Math.round((n.proteins_100g || 0) * 10) / 10,
              carbs:    Math.round((n.carbohydrates_100g || 0) * 10) / 10,
              fat:      Math.round((n.fat_100g || 0) * 10) / 10,
              fiber:    Math.round((n.fiber_100g || 0) * 10) / 10,
              sugar:    Math.round((n.sugars_100g || 0) * 10) / 10,
              sodium:   Math.round((n.sodium_100g || 0) * 1000 * 10) / 10,
              calcium:  Math.round((n.calcium_100g || 0) * 1000 * 10) / 10,
              iron:     Math.round((n.iron_100g || 0) * 1000 * 10) / 10,
              vitC:     Math.round((n['vitamin-c_100g'] || 0) * 1000 * 10) / 10,
              potassium:Math.round((n.potassium_100g || 0) * 1000 * 10) / 10,
              satFat:   Math.round((n['saturated-fat_100g'] || 0) * 10) / 10,
              cholesterol: Math.round((n.cholesterol_100g || 0) * 1000 * 10) / 10,
            };
          });
        foods = [...foods, ...offFoods];
      } catch(e) { console.error('OFF error:', e); }
    }

    // Deduplicate by name (case insensitive)
    const seen = new Set();
    const unique = foods.filter(f => {
      const key = f.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return res.status(200).json({ foods: unique, total: unique.length });

  } catch (err) {
    console.error('Nutrition search error:', err);
    return res.status(500).json({ error: 'Search failed. Try again.' });
  }
}
