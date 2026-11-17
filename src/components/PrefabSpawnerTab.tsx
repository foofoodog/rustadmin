import React, { useState } from 'react';
import { 
  Compass, 
  Plane, 
  Car, 
  Ship, 
  Hammer, 
  Sparkles, 
  Check, 
  Zap, 
  Crosshair, 
  MapPin, 
  ShieldAlert,
  Flame
} from 'lucide-react';
import { rconService } from '../services/rconService';

export interface WorldPrefab {
  id: string;
  name: string;
  prefab: string;
  category: 'Air' | 'Land' | 'Water' | 'Structures' | 'Events';
  description: string;
  icon: string;
}

const PREFABS: WorldPrefab[] = [
  // Air
  { id: 'mini', name: 'Minicopter', prefab: 'minicopter', category: 'Air', description: '2-seater agile helicopter', icon: '🚁' },
  { id: 'scrap', name: 'Scrap Transport Heli', prefab: 'scraptransporthelicopter', category: 'Air', description: 'Large 8-player transport helicopter', icon: '🚁' },
  { id: 'attack', name: 'Attack Helicopter', prefab: 'attackhelicopter.entity', category: 'Air', description: 'Armed military attack helicopter with rockets', icon: '⚔️' },
  { id: 'hab', name: 'Hot Air Balloon', prefab: 'hotairballoon', category: 'Air', description: 'Slow, peaceful high-altitude observation balloon', icon: '🎈' },

  // Land
  { id: 'car2', name: '2-Module Modular Car', prefab: 'modularcar_2module', category: 'Land', description: 'Compact engine and cab chassis', icon: '🚗' },
  { id: 'car3', name: '3-Module Modular Car', prefab: 'modularcar_3module', category: 'Land', description: 'Medium car with extra seating or storage', icon: '🚙' },
  { id: 'car4', name: '4-Module Modular Car', prefab: 'modularcar_4module', category: 'Land', description: 'Full-length heavy armored chassis', icon: '🚐' },
  { id: 'moto', name: 'Motorbike', prefab: 'motorbike', category: 'Land', description: 'High-speed 2-wheel dirt bike', icon: '🏍️' },
  { id: 'bike', name: 'Bicycle', prefab: 'bicycle', category: 'Land', description: 'Silent pedal-powered bicycle', icon: '🚲' },
  { id: 'snow', name: 'Snowmobile', prefab: 'snowmobile', category: 'Land', description: 'Winter biome snowmobile vehicle', icon: '🛷' },

  // Water
  { id: 'tug', name: 'Tugboat', prefab: 'tugboat', category: 'Water', description: 'Floating fortress base with lockable doors', icon: '🚢' },
  { id: 'rhib', name: 'RHIB Police Boat', prefab: 'rhib', category: 'Water', description: 'High-speed tactical motorboat', icon: '🚤' },
  { id: 'row', name: 'Rowboat', prefab: 'rowboat', category: 'Water', description: 'Small motorized wooden rowboat', icon: '🛶' },
  { id: 'sub1', name: 'Solo Submarine', prefab: 'submarinesolo.entity', category: 'Water', description: '1-person deep sea exploration submersible', icon: '🤿' },
  { id: 'sub2', name: 'Duo Submarine', prefab: 'submarineduo.entity', category: 'Water', description: '2-person torpedo-capable submarine', icon: '⚓' },

  // Structures & Deployed
  { id: 'wb1', name: 'Tier 1 Workbench', prefab: 'workbench1.deployed', category: 'Structures', description: 'Basic tier 1 crafting station', icon: '🪵' },
  { id: 'wb2', name: 'Tier 2 Workbench', prefab: 'workbench2.deployed', category: 'Structures', description: 'Mid-tier crafting and experimentation', icon: '⚙️' },
  { id: 'wb3', name: 'Tier 3 Workbench', prefab: 'workbench3.deployed', category: 'Structures', description: 'High-end tech crafting station', icon: '🔬' },
  { id: 'research', name: 'Research Table', prefab: 'researchtable_deployed', category: 'Structures', description: 'Blueprint unlock station', icon: '📋' },
  { id: 'repair', name: 'Repair Bench', prefab: 'repairbench_deployed', category: 'Structures', description: 'Weapon & armor skin/repair station', icon: '🔧' },

  // Events
  { id: 'airdrop', name: 'Supply Drop Plane', prefab: 'supply.drop', category: 'Events', description: 'Call high-altitude cargo plane drop', icon: '🪂' },
  { id: 'bradley', name: 'Bradley APC Tank', prefab: 'bradleyapc', category: 'Events', description: 'Spawn aggressive Bradley tank', icon: '🛡️' },
  { id: 'heli', name: 'Patrol Helicopter', prefab: 'patrolhelicopter', category: 'Events', description: 'Spawn roaming attack patrol helicopter', icon: '🎯' }
];

export const PrefabSpawnerTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [toast, setToast] = useState<string | null>(null);
  const [spawningId, setSpawningId] = useState<string | null>(null);
  const [spawnCoords, setSpawnCoords] = useState<string>('');

  const handleSpawn = async (item: WorldPrefab) => {
    setSpawningId(item.id);
    try {
      if (item.category === 'Events' && item.prefab.includes('.')) {
        await rconService.sendCommand(item.prefab);
      } else {
        const cmd = spawnCoords.trim() 
          ? `spawnat ${item.prefab} ${spawnCoords.trim()}`
          : `spawn ${item.prefab}`;
        await rconService.sendCommand(cmd);
      }
      setToast(`Spawned: ${item.name}`);
    } catch (err: any) {
      setToast(`Failed to spawn: ${err.message}`);
    } finally {
      setSpawningId(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const filteredPrefabs = PREFABS.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory
  );

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-800 border border-rust-500/50 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm flex items-center space-x-2 animate-bounce">
          <Zap className="w-4 h-4 text-rust-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <Compass className="w-5 h-5 text-rust-500 shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-zinc-100">Vehicle & Prefab World Spawner</h2>
              <span className="px-2 py-0.5 bg-zinc-800 text-rust-400 font-mono text-xs font-semibold rounded">
                {PREFABS.length} Entities
              </span>
            </div>
            <p className="text-xs text-zinc-400">1-click world physical entity instantiation (air, land, sea & structures)</p>
          </div>
        </div>

        {/* Optional Target Coordinates */}
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Spawn at Coords (x y z optional)..."
            value={spawnCoords}
            onChange={(e) => setSpawnCoords(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-56 font-mono"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2">
        {['All', 'Air', 'Land', 'Water', 'Structures', 'Events'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === cat
                ? 'bg-rust-600 text-white'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Prefabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredPrefabs.map((item) => {
          const isSpawning = spawningId === item.id;
          return (
            <div
              key={item.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-rust-500/60 transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-zinc-100 group-hover:text-rust-400 transition-colors">
                  {item.name}
                </h3>
                <span className="text-[10px] font-mono text-zinc-500 block truncate mt-0.5">
                  spawn {item.prefab}
                </span>
                <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => handleSpawn(item)}
                disabled={isSpawning}
                className="mt-4 w-full py-1.5 bg-zinc-800 hover:bg-rust-600 active:bg-rust-700 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSpawning ? 'animate-spin' : ''}`} />
                <span>{isSpawning ? 'Spawning...' : 'Spawn Entity'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
