const fs = require('fs');
const https = require('https');
const path = require('path');

const detailsPath = path.join(__dirname, '../src/data/wikiItemDetails.json');
const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));

const shortnames = Object.keys(details).filter(k => details[k] && details[k].recycle && details[k].recycle.length > 0);
console.log(`Starting recycling split update for ${shortnames.length} items...`);

function parseRecycle(markup) {
  const recIdx = markup.indexOf('# Recycle');
  if (recIdx === -1) return null;
  const nextHeader = markup.indexOf('\n# ', recIdx + 9);
  const recSection = nextHeader !== -1 ? markup.slice(recIdx, nextHeader) : markup.slice(recIdx);

  const safeZoneIdx = recSection.indexOf('Safe Zone Recycler');
  let standardText = recSection;
  let safeZoneText = null;

  if (safeZoneIdx !== -1) {
    standardText = recSection.slice(0, safeZoneIdx);
    safeZoneText = recSection.slice(safeZoneIdx);
  }

  const parseTable = (text) => {
    const matches = text.matchAll(
      /\|\s*!\[.*?\](?:\[.*?\]|\(.*?\))\s*\[(.*?)\](?:\[.*?\]|\(.*?\))\s*\|\s*([0-9,]+)\s*\|\s*([0-9]+%?)\s*\|/g
    );
    const outputs = [];
    for (const m of matches) {
      outputs.push({
        item: m[1].trim(),
        quantity: parseInt(m[2].replace(/,/g, ''), 10),
        chance: m[3].trim()
      });
    }
    return outputs;
  };

  const standard = parseTable(standardText);
  const safeZone = safeZoneText ? parseTable(safeZoneText) : null;

  return { standard, safeZone };
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
  let updatedCount = 0;

  for (let i = 0; i < shortnames.length; i += BATCH_SIZE) {
    const chunk = shortnames.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(chunk.map(s => fetchItem(s)));

    for (let j = 0; j < chunk.length; j++) {
      const s = chunk[j];
      const json = results[j];
      if (json && json.markup) {
        const parsed = parseRecycle(json.markup);
        if (parsed && parsed.standard && parsed.standard.length > 0) {
          details[s].recycle = parsed.standard;
          if (parsed.safeZone && parsed.safeZone.length > 0) {
            details[s].recycleSafeZone = parsed.safeZone;
          } else {
            delete details[s].recycleSafeZone;
          }
          updatedCount++;
        }
      }
    }

    if ((i + BATCH_SIZE) % 150 < BATCH_SIZE || i + BATCH_SIZE >= shortnames.length) {
      console.log(`Progress: ${Math.min(i + BATCH_SIZE, shortnames.length)} / ${shortnames.length} checked (${updatedCount} updated)`);
      fs.writeFileSync(detailsPath, JSON.stringify(details, null, 2));
    }

    await new Promise(r => setTimeout(r, 100));
  }

  fs.writeFileSync(detailsPath, JSON.stringify(details, null, 2));
  console.log(`Finished! Total ${updatedCount} items updated with separated Safe Zone recycling.`);
}

run();
