import React, { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Users, 
  MapPin, 
  ExternalLink, 
  Compass, 
  Crosshair,
  Zap,
  RefreshCw
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { ServerStatus } from '../types/rcon';

interface MapPlayerPos {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
}

interface Monument {
  name: string;
  x: number;
  z: number;
  type: 'major' | 'minor' | 'safezone';
}

export const MapTab: React.FC = () => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [mapSize, setMapSize] = useState<number>(2500);
  const [mapSeed, setMapSeed] = useState<string>('1584212361');
  const [zoom, setZoom] = useState<number>(1);
  const [players, setPlayers] = useState<MapPlayerPos[]>([]);
  const [selectedCoord, setSelectedCoord] = useState<{ x: number; z: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Notable monuments on the 2500_1584212361 map
  const monuments: Monument[] = [
    { name: 'Outpost', x: 0, z: -120, type: 'safezone' },
    { name: 'Bandit Town', x: -350, z: 280, type: 'safezone' },
    { name: 'Nuclear Missile Silo', x: 210, z: 450, type: 'major' },
    { name: 'Sphere Tank (The Dome)', x: 420, z: -280, type: 'major' },
    { name: 'Military Base', x: -580, z: -150, type: 'major' },
    { name: 'Trainyard', x: -180, z: 120, type: 'major' },
    { name: 'Ferry Terminal', x: -750, z: -600, type: 'minor' },
    { name: 'Large Oilrig', x: 920, z: 850, type: 'major' },
    { name: 'Small Oilrig', x: 880, z: -820, type: 'major' },
  ];

  useEffect(() => {
    const unsub = rconService.onStatus(setStatus);
    rconService.sendCommand('status');
    fetchPlayerPositions();

    const interval = setInterval(() => {
      fetchPlayerPositions();
    }, 5000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const fetchPlayerPositions = async () => {
    try {
      const resp = await rconService.sendCommand('playerlistpos');
      if (resp && resp.Message) {
        parsePlayerPositions(resp.Message);
      }
    } catch {
      // ignore
    }
  };

  const parsePlayerPositions = (text: string) => {
    // Rust playerlistpos format: SteamID "PlayerName" (x, y, z) (rot)
    const list: MapPlayerPos[] = [];
    const lines = text.split('\n');
    for (const line of lines) {
      const m = line.match(/^(\d{17})\s+"([^"]+)"\s+\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/);
      if (m) {
        list.push({
          id: m[1],
          name: m[2],
          x: parseFloat(m[3]),
          y: parseFloat(m[4]),
          z: parseFloat(m[5]),
        });
      }
    }
    setPlayers(list);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel (0 to rect.width) to world coords (-mapSize/2 to mapSize/2)
    // Note: Rust Z is inverted (top is positive Z, bottom is negative Z)
    const half = mapSize / 2;
    const worldX = Math.round(((clickX / rect.width) * mapSize) - half);
    const worldZ = Math.round(half - ((clickY / rect.height) * mapSize));

    setSelectedCoord({ x: worldX, z: worldZ });
  };

  const handleTeleport = async () => {
    if (!selectedCoord) return;
    try {
      await rconService.sendCommand(`teleportpos ${selectedCoord.x} 50 ${selectedCoord.z}`);
      setToast(`Teleported to (${selectedCoord.x}, 50, ${selectedCoord.z})`);
    } catch (err: any) {
      setToast(`Failed: ${err.message}`);
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Convert world X, Z into percentage positions for CSS (0% to 100%)
  const toPercentage = (x: number, z: number) => {
    const half = mapSize / 2;
    const left = ((x + half) / mapSize) * 100;
    const top = ((half - z) / mapSize) * 100;
    return { left: `${left}%`, top: `${top}%` };
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-800 border border-rust-500/50 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm flex items-center space-x-2 animate-bounce">
          <Zap className="w-4 h-4 text-rust-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <MapIcon className="w-5 h-5 text-rust-500" />
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
              <span>Interactive Map Browser</span>
              <span className="px-2 py-0.5 bg-zinc-800 text-rust-400 font-mono text-xs rounded">
                Size: {mapSize} • Seed: {mapSeed}
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Click anywhere on the map to inspect coordinates or teleport</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              className="p-1.5 hover:bg-zinc-800 text-zinc-300 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-1 text-zinc-400">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
              className="p-1.5 hover:bg-zinc-800 text-zinc-300 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 hover:bg-zinc-800 text-zinc-300 rounded"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh Positions */}
          <button
            onClick={fetchPlayerPositions}
            className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Players</span>
          </button>

          {/* External RustMaps link */}
          <a
            href={`https://rustmaps.com/map/${mapSize}_${mapSeed}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-3 py-1.5 bg-rust-600 hover:bg-rust-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <span>RustMaps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Map Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Canvas Area */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-hidden shadow-sm flex items-center justify-center min-h-[580px] relative">
          <div
            ref={mapContainerRef}
            onClick={handleMapClick}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="relative w-[520px] h-[520px] bg-zinc-950 rounded-xl overflow-hidden shadow-2xl cursor-crosshair border border-zinc-800 transition-transform duration-150 select-none"
          >
            {/* Map Terrain Image */}
            <img
              src="https://content.rustmaps.com/maps/290/4349c039912148afb138c9d2590b7b1d/map_raw_normalized.webp"
              alt="Rust Map"
              className="w-full h-full object-cover pointer-events-none opacity-90"
            />

            {/* Grid Overlay */}
            <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 pointer-events-none opacity-20 border border-white/20">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="border border-white/20 flex items-start p-1 text-[8px] font-mono text-white">
                  {String.fromCharCode(65 + (i % 5))}{Math.floor(i / 5) + 1}
                </div>
              ))}
            </div>

            {/* Monuments Pins */}
            {monuments.map((m) => {
              const pos = toPercentage(m.x, m.z);
              return (
                <div
                  key={m.name}
                  style={{ left: pos.left, top: pos.top }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group pointer-events-auto"
                >
                  <div className={`w-3 h-3 rounded-full border border-white flex items-center justify-center shadow-md ${
                    m.type === 'safezone' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-black/90 text-white text-[10px] rounded whitespace-nowrap z-20 pointer-events-none border border-zinc-700">
                    {m.name}
                  </div>
                </div>
              );
            })}

            {/* Live Player Pins */}
            {players.map((p) => {
              const pos = toPercentage(p.x, p.z);
              return (
                <div
                  key={p.id}
                  style={{ left: pos.left, top: pos.top }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group pointer-events-auto z-10"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-white shadow-lg animate-pulse" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-cyan-950 text-cyan-200 text-[10px] font-bold rounded whitespace-nowrap z-20 border border-cyan-700">
                    {p.name}
                  </div>
                </div>
              );
            })}

            {/* Clicked Target Marker */}
            {selectedCoord && (
              <div
                style={toPercentage(selectedCoord.x, selectedCoord.z)}
                className="absolute pointer-events-none z-20"
              >
                {/* Ping pulse centered on point */}
                <div className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-rust-500 bg-rust-500/20 animate-ping" />

                {/* Crosshair centered on point */}
                <div className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <Crosshair className="w-6 h-6 text-rust-400 drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]" />
                  {/* Exact center dot */}
                  <div className="w-1.5 h-1.5 rounded-full bg-rust-500 absolute" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Sidebar: Coordinates & Actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-rust-500" />
                <span>Selected Coordinates</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Click the map to select a world location</p>
            </div>

            {selectedCoord ? (
              <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">World X:</span>
                  <span className="font-mono font-bold text-zinc-200">{selectedCoord.x} m</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">World Z:</span>
                  <span className="font-mono font-bold text-zinc-200">{selectedCoord.z} m</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Teleport Command:</span>
                  <span className="font-mono text-rust-400 text-[11px]">teleportpos {selectedCoord.x} 50 {selectedCoord.z}</span>
                </div>
                <button
                  onClick={handleTeleport}
                  className="w-full mt-2 py-2 bg-rust-600 hover:bg-rust-500 active:bg-rust-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Teleport to Location</span>
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-zinc-500 text-xs bg-zinc-950/40 rounded-lg border border-dashed border-zinc-800">
                Click on the map surface to inspect coordinates and teleport.
              </div>
            )}

            {/* Monument Key */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Monument Legend
              </span>
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Safe Zones (Outpost, Bandit)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Monuments & Oilrigs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                  <span>Live Player Positions ({players.length})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 border-t border-zinc-800 pt-3">
            Procedural map rendered at scale 1:1. Coordinates match Rust in-game console coordinates.
          </div>
        </div>
      </div>
    </div>
  );
};
