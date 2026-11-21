const fs = require('fs');
const https = require('https');
const path = require('path');

const detailsPath = path.join(__dirname, '../src/data/wikiItemDetails.json');
const allPath = path.join(__dirname, '../src/data/allRustItems.json');

const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));
const all = JSON.parse(fs.readFileSync(allPath, 'utf8'));

const foods = all.filter(i => i.category === 'Food').map(f => f.shortname);
console.log(`Starting nutrition scrape for ${foods.length} food items...`);

function parseNutrition(markup) {
  if (!markup) return null;
  const nIdx = markup.indexOf('# Nutrition');
  if (nIdx === -1) return null;
  const next = markup.indexOf('\n# ', nIdx + 11);
  const section = next !== -1 ? markup.slice(nIdx, next) : markup.slice(nIdx);

  const calMatch = section.match(/\|\s*Calories\s*\|\s*([^|\n]+)\|/i);
  const hydMatch = section.match(/\|\s*Hydration\s*\|\s*([^|\n]+)\|/i);
  const instMatch = section.match(/\|\s*Instant Health\s*\|\s*([^|\n]+)\|/i);
  const otMatch = section.match(/\|\s*Healing Over Time\s*\|\s*([^|\n]+)\|/i);

  const res = {};
  if (calMatch) res.calories = calMatch[1].trim();
  if (hydMatch) res.hydration = hydMatch[1].trim();
  if (instMatch) res.instantHealth = instMatch[1].trim();
  if (otMatch) res.healthOverTime = otMatch[1].trim();

  return Object.keys(res).length > 0 ? res : null;
}

function fetchItem(shortname) {
  return new Promise((resolve) => {
    https.get(`https://wiki.facepunch.com/rust/item/${encodeURIComponent(shortname)}?format=json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  const BATCH_SIZE = 15;
  let count = 0;

  for (let i = 0; i < foods.length; i += BATCH_SIZE) {
    const chunk = foods.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(chunk.map(s => fetchItem(s)));

    for (let j = 0; j < chunk.length; j++) {
      const s = chunk[j];
      const json = results[j];
      if (json && json.markup) {
        const nut = parseNutrition(json.markup);
        if (nut) {
          if (!details[s] || details[s] === false) {
            details[s] = {};
          }
          details[s].nutrition = nut;
          count++;
        }
      }
    }
    await new Promise(r => setTimeout(r, 100));
  }

  fs.writeFileSync(detailsPath, JSON.stringify(details, null, 2));
  console.log(`Finished! Added nutrition metrics to ${count} food items.`);
}

run();
