const https = require('https');
const fs = require('fs');
const path = require('path');

const ITEMS_FILE = path.join(__dirname, '../src/data/allRustItems.json');
const DETAILS_FILE = path.join(__dirname, '../src/data/wikiItemDetails.json');
const LOG_FILE = path.join(__dirname, '../src/data/scrape_details_log.txt');

const ALIASES = {
  'hazmatsuit.spacesuit': 'hazmatsuit',
  'hazmatsuit.nomadsuit': 'hazmatsuit',
  'hazmatsuit.arcticsuit': 'hazmatsuit',
  'hazmatsuit.lumberjack': 'hazmatsuit',
  'hazmatsuit.abyss': 'hazmatsuit',
  'door.hinged.industrial': 'door.hinged.metal',
  'door.double.hinged.industrial': 'door.double.hinged.metal',
  'box.wooden.large.camo': 'box.wooden.large',
  'ballista.mounted': 'ballista.static'
};

function parseDetails(markup) {
  if (!markup) return null;
  const res = {};

  // 1. Crafting
  const craftIdx = markup.indexOf('# Craft');
  if (craftIdx !== -1) {
    const nextHeader = markup.indexOf('\n# ', craftIdx + 7);
    const craftSection = nextHeader !== -1 ? markup.slice(craftIdx, nextHeader) : markup.slice(craftIdx);

    const ingMatches = craftSection.matchAll(
      /\|\s*!\[.*?\](?:\[.*?\]|\(.*?\))\s*\[(.*?)\](?:\[.*?\]|\(.*?\))\s*\|\s*([0-9,]+)\s*\|/g
    );
    const ingredients = [];
    for (const m of ingMatches) {
      ingredients.push({ item: m[1].trim(), quantity: parseInt(m[2].replace(/,/g, ''), 10) });
    }

    const yieldMatch = craftSection.match(/\|\s*Yield\s*\|\s*([0-9]+)\s*\|/i);
    const timeMatch = craftSection.match(/\|\s*Workbench[^|]*\|\s*([0-9]+\s*sec)\s*\|/i);

    if (ingredients.length > 0) {
      res.craft = {
        ingredients,
        yield: yieldMatch ? parseInt(yieldMatch[1], 10) : 1,
        craftTime: timeMatch ? timeMatch[1].trim() : null
      };
    }
  }

  // Research Table & Tech tree costs
  const researchIdx = markup.indexOf('# Research');
  if (researchIdx !== -1) {
    const nextHeader = markup.indexOf('\n# ', researchIdx + 10);
    const resSection = nextHeader !== -1 ? markup.slice(researchIdx, nextHeader) : markup.slice(researchIdx);
    const tableMatch = resSection.match(/Research Table.*?([0-9,]+)\s*\[Scrap\]/i);
    const treeMatch = resSection.match(/Tech Tree.*?([0-9,]+)\s*\[Scrap\]/i);

    if (tableMatch || treeMatch) {
      if (!res.craft) res.craft = {};
      if (tableMatch) res.craft.researchCost = parseInt(tableMatch[1].replace(/,/g, ''), 10);
      if (treeMatch) res.craft.techTreeCost = parseInt(treeMatch[1].replace(/,/g, ''), 10);
    }
  }

  // 2. Recycling
  const recIdx = markup.indexOf('# Recycle');
  if (recIdx !== -1) {
    const nextHeader = markup.indexOf('\n# ', recIdx + 9);
    const recSection = nextHeader !== -1 ? markup.slice(recIdx, nextHeader) : markup.slice(recIdx);

    const recMatches = recSection.matchAll(
      /\|\s*!\[.*?\](?:\[.*?\]|\(.*?\))\s*\[(.*?)\](?:\[.*?\]|\(.*?\))\s*\|\s*([0-9,]+)\s*\|\s*([0-9]+%?)\s*\|/g
    );
    const outputs = [];
    const seen = new Set();
    for (const m of recMatches) {
      const key = `${m[1].trim()}-${m[2]}-${m[3]}`;
      if (!seen.has(key)) {
        seen.add(key);
        outputs.push({
          item: m[1].trim(),
          quantity: parseInt(m[2].replace(/,/g, ''), 10),
          chance: m[3].trim()
        });
      }
    }
    if (outputs.length > 0) {
      res.recycle = outputs.slice(0, 8); // Top items
    }
  }

  // 3. Loot Sources
  const lootIdx = markup.indexOf('# Loot Sources');
  if (lootIdx !== -1) {
    const nextHeader = markup.indexOf('\n# ', lootIdx + 14);
    const lootSection = nextHeader !== -1 ? markup.slice(lootIdx, nextHeader) : markup.slice(lootIdx);

    const lootMatches = lootSection.matchAll(/\|\s*\[(.*?)\]\(.*?\)\s*\|\s*([0-9-]+)\s*\|\s*([0-9.]+)\s*\|/g);
    const sources = [];
    for (const m of lootMatches) {
      sources.push({
        source: m[1].trim(),
        amount: m[2].trim(),
        chance: parseFloat(m[3])
      });
    }
    if (sources.length > 0) {
      sources.sort((a, b) => b.chance - a.chance);
      res.loot = sources.slice(0, 8);
    }
  }

  // 4. Ammo For (for ammunition items)
  const ammoIdx = markup.indexOf('# Ammo For');
  if (ammoIdx !== -1) {
    const nextHeader = markup.indexOf('\n# ', ammoIdx + 10);
    const ammoSection = nextHeader !== -1 ? markup.slice(ammoIdx, nextHeader) : markup.slice(ammoIdx);

    const matches = ammoSection.matchAll(
      /\|\s*!\[.*?\](?:\[.*?\]|\(.*?\))\s*\[(.*?)\](?:\[.*?\]|\(.*?\))\s*\|\s*([0-9.]+)\s*\|\s*([0-9.]+)\s*\|\s*([0-9.]+)\s*\|\s*([^\s|]+)\s*\|/g
    );
    const weapons = [];
    for (const m of matches) {
      weapons.push({
        weapon: m[1].trim(),
        damage: parseFloat(m[2]),
        dps: parseFloat(m[3]),
        velocity: parseFloat(m[4]),
        headshot: m[5].trim()
      });
    }
    if (weapons.length > 0) {
      res.ammoFor = weapons;
    }
  }

  return Object.keys(res).length > 0 ? res : null;
}

function fetchWikiItem(shortname) {
  const targetShortname = ALIASES[shortname] || shortname;
  const url = `https://wiki.facepunch.com/rust/item/${encodeURIComponent(targetShortname)}?format=json`;

  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'RustAdmin-DataSync/1.0 (foofoodog@hotmail.com)'
        },
        timeout: 8000
      },
      (res) => {
        if (res.statusCode !== 200) {
          return resolve(null);
        }
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json && json.markup) {
              resolve(parseDetails(json.markup));
            } else {
              resolve(null);
            }
          } catch (e) {
            resolve(null);
          }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('Starting full details scraper (crafting, recycling, loot, ammo)...');

  const rawItems = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8'));
  let details = {};
  if (fs.existsSync(DETAILS_FILE)) {
    try {
      details = JSON.parse(fs.readFileSync(DETAILS_FILE, 'utf-8'));
      console.log(`Loaded ${Object.keys(details).length} existing detailed items.`);
    } catch (e) {}
  }

  let count = 0;
  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    const s = item.shortname;

    if (details[s] !== undefined) {
      continue;
    }

    const data = await fetchWikiItem(s);
    details[s] = data || false; // Store false if no details on wiki so we don't re-fetch
    count++;

    if ((count) % 25 === 0) {
      fs.writeFileSync(DETAILS_FILE, JSON.stringify(details, null, 2));
      console.log(`Progress: ${i + 1}/${rawItems.length} checked (${Object.keys(details).filter(k => details[k]).length} items with details).`);
    }

    await sleep(250); // 250ms polite delay
  }

  fs.writeFileSync(DETAILS_FILE, JSON.stringify(details, null, 2));
  console.log('Done! All item details saved to wikiItemDetails.json');
}

main().catch(console.error);
