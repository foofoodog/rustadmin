# RustAdmin WebRCON

A fast, modern server administration web UI for Rust Dedicated Servers built on WebSocket WebRCON.

## Features

- **📊 Live Dashboard:** Server metrics (players online, max slots, queued, map, protocol build, secure mode).
- **☀️ World & Environment:** Time of Day slider (`env.time`), Weather presets (Clear, Rain, Fog, Storm), and quick maintenance controls (Save, 5m Restart, Cancel Restart).
- **🚁 Monument & Event Spawner:** 1-Click triggers for Patrol Helicopter (`spawn heli`), Cargo Ship (`spawn cargoship`), Bradley APC (`spawn bradley`), and Supply Drops (`supply.call`).
- **💻 Live Console:** Streaming terminal feed with command history (Up/Down arrow keys), log type filters, search filter, auto-scroll toggle, and quick command shortcuts.
- **👥 Player Management:** Searchable player table with SteamIDs, ping badges, connection time, and 1-click player moderation (Kick, Ban, Mute, Teleport to me, Give items).
- **🧩 Oxide / uMod Plugin Manager:** Table of all loaded plugins with memory usage, versions, reload single plugin, unload, and real-time compilation error banners.
- **💬 Real-Time Chat:** Live chat stream with global server announcements (`say <msg>`).
- **🔒 Pure Client-Side SPA:** Credentials stay in your browser (`localStorage`); zero server backend required.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```
The output in `dist/` can be served by any web server (Caddy, Nginx, GitHub Pages, or static file server).
