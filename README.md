# RustAdmin WebRCON

[![Deploy to GitHub Pages](https://github.com/foofoodog/rustadmin/actions/workflows/deploy.yml/badge.svg)](https://github.com/foofoodog/rustadmin/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20GitHub%20Pages-22c55e?style=flat&logo=github)](https://foofoodog.github.io/rustadmin/)

A modern, high-performance web administration suite for Rust Dedicated Servers built on WebSocket WebRCON. Fully self-contained, lightning-fast, and designed for server owners, administrators, and event hosts.

🎮 **Live Demo:** [https://foofoodog.github.io/rustadmin/](https://foofoodog.github.io/rustadmin/)  
👉 **[View Full Visual Tour with Screenshots (12 Views)](screenshots.md)**

---

## 🌟 Key Features

### 🗂️ Clean Hierarchical Navigation
Organized into 4 primary sections with an active contextual **Sub-Nav Bar**:
* **Server:** Overview • Rules & Convars • Automation & Tasks
* **Monitoring:** Live Console • Map & Radar • Combat & Raid Feed • In-Game Chat
* **Players:** Player Directory • Plugins & Permissions
* **Arsenal:** Item Browser • Kits & Loadouts • World Prefabs

---

### 📱 100% Offline Progressive Web App (PWA)
* **Installable as a Native Desktop / Mobile App:** Install RustAdmin directly from Chrome, Edge, Safari, or mobile browsers as a standalone application with taskbar icon, window controls, and quick launch shortcuts.
* **Full Offline Operation:** Service Worker pre-caches the application shell, scripts, styles, 2.57 MB item sprite sheet, and monument POI SVGs.
* **LAN & Air-Gapped Ready:** Connect directly to local dedicated servers (`127.0.0.1`), local LAN servers (`192.168.x.x`), or browse items, kits, and convars without an active internet connection.
* **In-App Install Trigger & Offline Badge:** Features an "Install App" prompt button in the header when available and displays an offline status indicator when running disconnected from the web.

---

### 📦 Ultra-Fast Item Browser (1,317 Items)
* **Single WebP Sprite Sheet:** All 1,317 official Rust items packed into a single 2.57 MB WebP sprite sheet (a 99.3% reduction from raw game assets) with zero individual HTTP requests.
* **Instant Rendering:** Pixel-perfect CSS background offsets with dynamic scaling (72px in grid, 56px in modals).
* **16 Categories:** All, Weapons, Construction, Items, Resources, Attire, Tools, Medical, Food, Ammo, Traps, Misc, Components, Electrical, Fun, Vehicles, and DLC/Packs.
* **DLC & Special Content Detection:** Highlights 197+ DLC items (Abyss Pack, Sunburn, Voice Props, Instruments, Arctic, Lumberjack, Frontier, Medieval, Lunar New Year) with distinctive badges and admin spawning permissions guidance.
* **Direct Player Delivery:** 1-Click give to Self/Console or any connected player with quantity presets and max stack buttons.

---

### 🛡️ Kits & Custom Loadout Spawner
* **Built-in Presets:**
  * **Full Metal AK-47:** Metal armor, hoodie/pants, boots, tactical gloves, AK-47, 5.56 ammo, meds.
  * **Roadsign SAR:** Semi-Auto Rifle, coffee can helmet, roadsign armor, ammo, syringes.
  * **Heavy Raid Breacher:** Heavy plate set, rocket launcher, HV rockets, timed C4, syringes.
  * **Base Builder Starter:** Building plan, hammer, TC, 5k wood, 5k stone, 2k metal frags, doors, code locks.
  * **Electrician Toolkit:** Wire tool, large battery, solar panels, branches, switches, splitters, ceiling lights.
  * **Emergency Medic Kit:** Large medkits, syringes, bandages, anti-radiation pills.
* **Visual Kit Creator:** Pick any items using visual sprites, configure quantities, and save custom kits to `localStorage`.
* **Sequential Batch Give:** 1-Click delivery of an entire kit to any target player.

---

### 🗺️ Interactive Live Map & Radar
* **Monument POIs:** Real-time marker overlays with custom SVGs for major radtowns, safe zones, harbors, oil rigs, underwater labs, and quarries.
* **Live Player Tracking:** Real-time pins showing online players with status radar pings.
* **Click-to-Teleport:** Click anywhere on the map or select any POI to center, inspect coordinates $(X, Z)$, copy teleport commands, teleport immediately (`teleportpos x y z`), or spawn a minicopter at coordinates.

---

### ⚔️ Live Combat, Raid & Anti-Cheat Feed
* **Kill Feed:** Real-time parser for player vs. player combat deaths and weapon types.
* **Raid Detector:** Instantly flags Timed Explosives (C4), Rockets, Satchels, and MLRS detonations with audio/visual warnings.
* **Anti-Cheat Violation Ticker:** Surfaces automatic server kicks, `flyhack: violation`, `speedhack`, and `eyehack` warnings with instant **Kick** and **Ban** moderation buttons.

---

### ⚙️ Server Rules & Convars Manager
* **Live Gameplay Controls:** Adjust `decay.scale`, `decay.upkeep`, `server.stability`, `server.radiation`, `server.pve`, and `relationshipmanager.maxteamsize` with live sliders and toggle switches.
* **Day & Night Cycles:** Custom duration sliders for daytime (`env.daylength`) and nighttime (`env.nightlength`).
* **1-Click Ruleset Presets:** Quick-apply "Vanilla Competitive", "Build & Creative Sandbox", or "Solo Hardcore" rulesets.

---

### ⏰ Server Automation & Scheduled Tasks
* **Graceful Restart Wizard:** Multi-stage countdown (1m, 5m, 10m) that automatically broadcasts scheduled warnings to players at 10m, 5m, 1m, and 10s, performs `server.save`, and triggers `restart` (with 1-click abort).
* **Recurring Chat Announcer:** Configure repeating chat broadcasts (Discord links, wipe countdowns, server rules) on customizable intervals.
* **Wipe Day Assistant:** Map seed randomizer, world size slider (2000m–5000m), and server hostname configuration.

---

### 🚁 World Entity & Vehicle Spawner
* 1-Click physical entity instantiation into the game world:
  * **Air:** Minicopter, Scrap Transport Heli, Attack Helicopter, Hot Air Balloon.
  * **Land:** 2/3/4-Module Modular Cars, Motorbike, Bicycle, Snowmobile.
  * **Water:** Tugboat, RHIB, Rowboat, Solo/Duo Submarines.
  * **Deployables:** Workbenches (T1, T2, T3), Research Table, Repair Bench.
  * **Events:** Call Patrol Helicopter, Bradley APC, or Airdrop plane.

---

### 🧩 Oxide / uMod Plugin Manager & Nested Permissions
* **Plugin Management:** Table with status indicators, memory usage, reload, unload, and real-time compilation error banners.
* **Twisty Expanding Permissions Grid:** Each plugin row expands to reveal a group-based permissions matrix.
* **1-Click Permission Toggles:** Grant or revoke permissions (`oxide.grant group <group> <perm>`) with live checkmarks and batch actions ("Grant All", "Revoke All").
* **Core Oxide Permissions:** Integrated management of core system permissions.

---

### 💻 Live Console with Autocomplete & Multi-Level History
* **Multi-Level History:** Smooth `<Up>` and `<Down>` navigation through 100 historical commands with draft preservation.
* **Tab Completion:** Tab key auto-completes command names with a trailing space without accidental execution.
* **Active Argument Helper:** Shows live syntax guides, parameter templates, clickable player SteamID chips, and quick argument pills as you type.

---

### 🌐 Multi-Server Profile Switcher
* Manage multiple server connection profiles (e.g. Local Dedicated, Main 2x, Staging Test).
* 1-Click profile switching from the header dropdown without retyping passwords.
* 100% Client-side SPA — credentials remain in your browser's `localStorage`.

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/foofoodog/rustadmin.git
cd rustadmin
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

### 3. Docker Deployment

#### A. Live Development with Hot-Reload (Recommended for local dev)
Runs Vite inside Docker and mounts your local folder. Any code edits you make in `src/` are picked up instantly without restarting:
```bash
docker compose -f docker-compose.dev.yml up -d
```
Open [http://localhost:5000](http://localhost:5000).

#### B. Production Nginx Container
Compiles an optimized static production build served by a minimal Alpine Nginx image:
```bash
docker compose up -d --build
```
Open [http://localhost:5000](http://localhost:5000).

### 4. Build for Production (Static Files)
```bash
npm run build
```
The output in `dist/` is pure static HTML/CSS/JS and can be hosted anywhere (Nginx, Caddy, GitHub Pages, Cloudflare Pages, or Docker).

---

## 🔒 Security & Privacy
* RustAdmin connects directly from your web browser to your Rust server's WebSocket WebRCON port (default: `28016`).
* No credentials, logs, or chat messages ever leave your machine or pass through an intermediary backend.

---

## 📄 License
MIT License.
