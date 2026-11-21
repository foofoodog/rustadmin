const https = require('https');
const fs = require('fs');
const path = require('path');

const ITEMS_FILE = path.join(__dirname, '../src/data/allRustItems.json');
const CACHE_FILE = path.join(__dirname, '../src/data/wikiScrapedItems.json');
const LOG_FILE = path.join(__dirname, '../src/data/scrape_log.txt');

// Custom alias map for shortnames that have different wiki URLs or prefixes
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

function cleanMarkdownLinks(str) {
  if (!str) return '';
  return str
    .replace(/!\[.*?\](\[.*?\]|\(.*?\))/g, '')
    .replace(/\[(.*?)\](\[.*?\]|\(.*?\))/g, '$1')
    .trim();
}

function parseMarkup(markup) {
  if (!markup) return null;
  const result = {};

  // Stack Size
  const stackMatch = markup.match(/\|\s*Stack Size\s*\|\s*([0-9,]+)\s*\|/i);
  if (stackMatch) {
    result.stackSize = parseInt(stackMatch[1].replace(/,/g, ''), 10);
  }

  // Despawn Time
  const despawnMatch = markup.match(/\|\s*Despawn Time\s*\|\s*([^|]+)\|/i);
  if (despawnMatch) {
    result.despawnTime = cleanMarkdownLinks(despawnMatch[1]);
  }

  // Boolean flags
  const boolMatch = (key) => {
    const m = markup.match(new RegExp(`\\|\\s*${key}\\s*\\|\\s*([^|]+)\\|`, 'i'));
    if (!m) return undefined;
    return m[1].toLowerCase().includes('true');
  };
  result.craftable = boolMatch('Craftable');
  result.repairable = boolMatch('Repairable');
  result.recyclable = boolMatch('Recyclable');
  result.researchable = boolMatch('Researchable');

  // Workbench Requirement
  const wbMatch = markup.match(/\|\s*Workbench Requirement\s*\|\s*([^|]+)\|/i);
  if (wbMatch) {
    result.workbench = cleanMarkdownLinks(wbMatch[1]) || null;
  }

  // Item ID
  const idMatch = markup.match(/\|\s*Item ID\s*\|\s*([0-9-]+)\s*\|/i);
  if (idMatch) {
    result.itemId = parseInt(idMatch[1], 10);
  }

  return result;
}

function fetchWikiItem(shortname) {
  const targetShortname = ALIASES[shortname] || shortname;
  const url = `https://wiki.facepunch.com/rust/item/${encodeURIComponent(targetShortname)}?format=json`;

  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'RustAdmin-DataSync/1.0 (Polite community tool; foofoodog@hotmail.com)'
        },
        timeout: 10000
      },
      (res) => {
        if (res.statusCode === 404) {
          return resolve({ notFound: true });
        }
        if (res.statusCode !== 200) {
          return resolve({ error: `HTTP ${res.statusCode}` });
        }

        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json && json.markup) {
              const parsed = parseMarkup(json.markup);
              resolve({ success: true, data: parsed, title: json.title });
            } else {
              resolve({ notFound: true });
            }
          } catch (e) {
            resolve({ error: e.message });
          }
        });
      }
    );

    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Timeout' });
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Starting polite Facepunch Wiki scraper (delay = 350ms)...');

  const rawItems = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8'));
  let cache = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      console.log(`Loaded ${Object.keys(cache).length} cached items.`);
    } catch (e) {
      console.error('Error reading cache:', e.message);
    }
  }

  let logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
  const log = (msg) => {
    console.log(msg);
    logStream.write(msg + '\n');
  };

  log(`[${new Date().toISOString()}] Scraper starting for ${rawItems.length} items.`);

  let updatedCount = 0;
  let mismatchCount = 0;
  let notFoundCount = 0;
  let alreadyCached = 0;

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    const s = item.shortname;

    if (cache[s]) {
      alreadyCached++;
      continue;
    }

    const res = await fetchWikiItem(s);

    if (res.notFound) {
      cache[s] = { notFound: true };
      notFoundCount++;
    } else if (res.success && res.data) {
      cache[s] = res.data;
      const wikiStack = res.data.stackSize;
      if (wikiStack !== undefined && wikiStack !== item.stackable) {
        log(`Mismatch on ${s}: Local=${item.stackable} -> Wiki=${wikiStack}`);
        mismatchCount++;
      }
      updatedCount++;
    } else if (res.error) {
      log(`Error fetching ${s}: ${res.error}`);
      // Don't cache hard failure so it retries next time
      await sleep(1000); // Backoff a bit on error
      continue;
    }

    // Save cache incrementally every 25 items
    if ((i + 1) % 25 === 0) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
      log(`Progress: ${i + 1}/${rawItems.length} items processed (${mismatchCount} mismatches found so far).`);
    }

    // Polite delay: 350ms between requests (~2.8 req/sec)
    await sleep(350);
  }

  // Final cache save
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  log(`Scrape finished! Total cached: ${Object.keys(cache).length}. Applying verified data to allRustItems.json...`);

  // Apply verified data to allRustItems.json
  let appliedChanges = 0;
  for (const item of rawItems) {
    const wikiData = cache[item.shortname];
    if (wikiData && !wikiData.notFound) {
      if (wikiData.stackSize !== undefined && wikiData.stackSize !== item.stackable) {
        item.stackable = wikiData.stackSize;
        appliedChanges++;
      }
      if (wikiData.despawnTime) {
        item.despawnTime = wikiData.despawnTime;
      }
      if (wikiData.workbench) {
        item.workbench = wikiData.workbench;
      }
      if (wikiData.craftable !== undefined) {
        item.craftable = wikiData.craftable;
      }
      if (wikiData.repairable !== undefined) {
        item.repairable = wikiData.repairable;
      }
      if (wikiData.recyclable !== undefined) {
        item.recyclable = wikiData.recyclable;
      }
      if (wikiData.researchable !== undefined) {
        item.researchable = wikiData.researchable;
      }
    }
  }

  fs.writeFileSync(ITEMS_FILE, JSON.stringify(rawItems, null, 2));
  log(`Updated allRustItems.json with ${appliedChanges} stack size fixes and enriched metadata.`);
}

main().catch((err) => {
  console.error('Fatal scraper error:', err);
});
