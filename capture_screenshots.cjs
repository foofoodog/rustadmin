const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, 'docs', 'screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const PAGES = [
  {
    id: 'dashboard',
    name: '01_server_overview.png',
    title: 'Server Overview & Dashboard',
    waitMs: 1500
  },
  {
    id: 'convars',
    name: '02_server_rules_convars.png',
    title: 'Rules & Convars Manager',
    waitMs: 1200
  },
  {
    id: 'automation',
    name: '03_server_automation.png',
    title: 'Server Automation & Scheduled Tasks',
    waitMs: 1200
  },
  {
    id: 'console',
    name: '04_live_console.png',
    title: 'Live Console with Autocomplete & History',
    waitMs: 1500
  },
  {
    id: 'map',
    name: '05_interactive_map.png',
    title: 'Interactive Live Map & Radar',
    waitMs: 2000
  },
  {
    id: 'combat',
    name: '06_combat_raid_feed.png',
    title: 'Live Combat, Raid & Anti-Cheat Feed',
    waitMs: 1200
  },
  {
    id: 'chat',
    name: '07_ingame_chat.png',
    title: 'In-Game Global Chat & Broadcaster',
    waitMs: 1200
  },
  {
    id: 'players-list',
    name: '08_player_directory.png',
    title: 'Player Directory & Moderation',
    waitMs: 1200
  },
  {
    id: 'plugins',
    name: '09_plugins_permissions.png',
    title: 'Oxide Plugins & Integrated Permissions Matrix',
    waitMs: 1500,
    beforeShot: async (page) => {
      // Expand core oxide or first plugin twisty if available
      try {
        const twisty = await page.$('button[title*="Expand permissions"], button[title*="permissions"]');
        if (twisty) {
          await twisty.click();
          await new Promise((r) => setTimeout(r, 600));
        }
      } catch (e) {}
    }
  },
  {
    id: 'items',
    name: '10_item_browser.png',
    title: 'Ultra-Fast WebP Sprite Item Browser (1,317 Items & DLC Badges)',
    waitMs: 1800
  },
  {
    id: 'kits',
    name: '11_kits_loadouts.png',
    title: 'Kits & Custom Loadout Spawner',
    waitMs: 1500
  },
  {
    id: 'prefabs',
    name: '12_prefab_spawner.png',
    title: 'Vehicle & World Prefab Spawner',
    waitMs: 1500
  }
];

(async () => {
  console.log('Launching headless Chrome to capture screenshots...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1600,1050'
    ],
    defaultViewport: {
      width: 1600,
      height: 1050,
      deviceScaleFactor: 1.5
    }
  });

  const page = await browser.newPage();

  // First open root to allow auto-connect
  await page.goto('http://localhost:5000/#dashboard', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  for (const item of PAGES) {
    const targetUrl = `http://localhost:5000/#${item.id}`;
    console.log(`Navigating to ${item.title} (${targetUrl})...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, item.waitMs));

    if (item.beforeShot) {
      await item.beforeShot(page);
    }

    const outPath = path.join(OUT_DIR, item.name);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`✓ Saved ${item.name}`);
  }

  await browser.close();
  console.log('All 12 screenshots captured successfully!');
})();
