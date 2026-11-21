import allItemsData from './allRustItems.json';
import { hasNutritionalValue, isAnimalFeed, hasItemBuffs } from './itemDetails';

export interface RustItem {
  id?: number;
  name: string;
  shortname: string;
  category: string;
  defaultAmount?: number;
  description?: string;
  stackable?: number;
  rarity?: string;
  icon?: string;
  isVehicle?: boolean;
  hasNutrition?: boolean;
  isFeed?: boolean;
  hasBuffs?: boolean;
  dlcPack?: string;
  isDlc?: boolean;
  despawnTime?: string;
  workbench?: string;
  craftable?: boolean;
  repairable?: boolean;
  recyclable?: boolean;
  researchable?: boolean;
}

export function getDlcPack(shortname: string, name: string): string | null {
  const s = shortname.toLowerCase();
  const n = name.toLowerCase();

  // Jungle Pack
  if (
    s.includes('cocoknight') ||
    s.includes('rifle.ak.jungle') ||
    s.includes('knife.bone.obsidian') ||
    s.includes('jungle.rock') ||
    s.includes('bamboo') ||
    (s.includes('wall.shelves') && n.includes('bamboo'))
  ) {
    return 'Jungle Pack';
  }

  // Artist Pack
  if (
    s.includes('sign.artistcanvas') ||
    s === 'easel' ||
    s.includes('paintball') ||
    s.includes('paintable')
  ) {
    return 'Artist Pack';
  }

  // Storage Box Pack
  if (s.startsWith('component.box.')) {
    return 'Storage Box Pack';
  }

  // Industrial Decor Pack
  if (
    s.includes('industrial') && (
      s.includes('shelves') ||
      s.includes('barrel') ||
      s.includes('door') ||
      s.includes('light') ||
      s.includes('torch')
    )
  ) {
    return 'Industrial Decor Pack';
  }

  // Weapon Racks Pack
  if (s.startsWith('gunrack') || s.startsWith('weaponrack')) {
    if (s.includes('frontier')) return 'Frontier Pack';
    return 'Weapon Racks Pack';
  }

  // Wallpaper Pack
  if (s.startsWith('wallpaper.')) {
    return 'Wallpaper Pack';
  }

  // Ice King Pack
  if (
    s.includes('icethrone') ||
    s.includes('icemask') ||
    s.includes('icevest') ||
    s.includes('ice.wall')
  ) {
    return 'Ice King Pack';
  }

  // Graffiti Pack
  if (s.startsWith('spraycan')) {
    return 'Graffiti Pack';
  }

  // Pilot Pack
  if (s.includes('hazmatsuit.pilot') || s.includes('pilot.hazmat.box.wooden')) {
    return 'Pilot Pack';
  }

  // Abyss Pack
  if (s.includes('diver') || s.includes('abyss')) return 'Abyss Pack';

  // Sunburn DLC
  if (
    s.includes('sunglasses') ||
    s.includes('beachtowel') ||
    s.includes('beachchair') ||
    s.includes('beachparasol') ||
    s.includes('beachtable') ||
    s.includes('boogieboard') ||
    s.includes('paddlingpool') ||
    s.includes('abovegroundpool') ||
    s.includes('innertube') ||
    s.includes('gun.water') ||
    s.includes('pistol.water') ||
    s.includes('instant_camera') ||
    s.includes('photoframe') ||
    s.includes('water.gun')
  ) {
    return 'Sunburn DLC';
  }

  // Voice Props DLC
  if (
    s.includes('cassette') ||
    s.includes('boombox') ||
    s.includes('connected.speaker') ||
    s.includes('mobilephone') ||
    s.includes('discoball') ||
    s.includes('discofloor') ||
    s.includes('laserlight') ||
    s.includes('soundlight') ||
    s.includes('strobelight') ||
    s.includes('megaphone') ||
    s.includes('microphonestand')
  ) {
    return 'Voice Props DLC';
  }

  // Instruments DLC
  if (
    s.includes('fun.bass') ||
    s.includes('fun.cowbell') ||
    s.includes('fun.flute') ||
    s.includes('fun.guitar') ||
    s.includes('fun.jerrycanguitar') ||
    s.includes('fun.tambourine') ||
    s.includes('fun.trumpet') ||
    s.includes('fun.tuba') ||
    s.includes('drumkit') ||
    s.includes('piano') ||
    s.includes('xylophone')
  ) {
    return 'Instruments DLC';
  }

  // Arctic Pack
  if (
    s.includes('arcticsuit') ||
    s.includes('tomaha') ||
    s.includes('rifle.ak.ice') ||
    s.includes('sculpture.ice')
  ) {
    return 'Arctic Pack';
  }

  // Lumberjack Pack
  if (s.includes('lumberjack')) return 'Lumberjack Pack';

  // Frontier Pack
  if (s.includes('frontier') || s.includes('rockingchair') || s.includes('wantedposter')) return 'Frontier Pack';

  // Medieval Pack
  if (
    s.includes('medieval') ||
    s.includes('knightsarmour') ||
    s.includes('knighttorso') ||
    s.includes('batteringram') ||
    s.includes('catapult') ||
    s.includes('ballista') ||
    s.includes('siegetower')
  ) {
    return 'Medieval Pack';
  }

  // Special Edition / Nomad / Space Packs
  if (
    s.includes('spacesuit') ||
    s.includes('nomadsuit') ||
    s.includes('alien.costume') ||
    s.includes('hazmat.plague') ||
    s.includes('hazmat.krieg') ||
    s.includes('krieg.')
  ) {
    return 'Special Edition Pack';
  }

  // Games Room Pack
  if (
    s.includes('arcade.machine.chippy') ||
    s.includes('pooltable') ||
    s.includes('cardtable') ||
    s.includes('dartboard') ||
    s.includes('gamesroom')
  ) {
    return 'Games Room Pack';
  }

  // Twitch Rivals
  if (s.includes('twitch')) return 'Twitch Drops';

  // Lunar New Year
  if (
    s.includes('dragonmask') ||
    s.includes('oxmask') ||
    s.includes('ratmask') ||
    s.includes('tigermask') ||
    s.includes('rabbitmask') ||
    s.includes('snakemask') ||
    s.includes('dragondoorknocker') ||
    s.includes('lunar.') ||
    s.includes('chineselantern') ||
    s.includes('lny26')
  ) {
    return 'Lunar New Year';
  }

  // Halloween
  if (
    s.includes('halloween') ||
    s.includes('frankenstein') ||
    s.includes('scarecrow') ||
    s.includes('ghostsheet') ||
    s.includes('cursedcauldron') ||
    s.includes('spiderweb') ||
    s.includes('jackolantern') ||
    s.includes('dracula') ||
    s.includes('mummymask') ||
    s.includes('skull_fire_pit') ||
    s.includes('skulldoorknocker') ||
    s.includes('skullspikes')
  ) {
    return 'Halloween Event';
  }

  // Festive / Xmas
  if (
    s.includes('xmas') ||
    s.includes('candycane') ||
    s.includes('giantcandycane') ||
    s.includes('giantlollipop') ||
    s.includes('gingerbread') ||
    s.includes('santa') ||
    s.includes('sled') ||
    s.includes('stocking')
  ) {
    return 'Festive Event';
  }

  return null;
}

export const VEHICLE_SHORTNAMES = new Set([
  'minicopter',
  'scraptransportheli',
  'scraptransportheli.repair',
  'attackhelicopter',
  'rowboat',
  'rhib',
  'tugboat',
  'submarinesolo',
  'submarineduo',
  '2module.car',
  '2module.car.chassis',
  '3module.car',
  '3module.car.chassis',
  '4module.car',
  '4module.car.chassis',
  'snowmobile',
  'snowmobiletomaha',
  'workcart',
  'locomotive',
  'motorbike',
  'bicycle',
  'pedalbike',
  'pedaltrike'
]);

// Determine intelligent default give amounts: full stack for stackable items, 1 for non-stackables
function computeDefaultAmount(item: any): number {
  const stack = item.stackable || 1;
  if (stack <= 1) return 1;
  return stack;
}

export const RUST_ITEMS: RustItem[] = (allItemsData as any[]).map((item) => {
  const dlc = getDlcPack(item.shortname, item.name);
  return {
    id: item.id,
    name: item.name,
    shortname: item.shortname,
    category: item.category,
    defaultAmount: computeDefaultAmount(item),
    description: item.description,
    stackable: item.stackable || 1,
    rarity: item.rarity,
    icon: item.icon || `${item.shortname}.webp`,
    isVehicle: VEHICLE_SHORTNAMES.has(item.shortname),
    hasNutrition: hasNutritionalValue(item.shortname),
    isFeed: isAnimalFeed(item.shortname),
    hasBuffs: hasItemBuffs(item.shortname),
    dlcPack: dlc || undefined,
    isDlc: !!dlc,
    despawnTime: item.despawnTime,
    workbench: item.workbench,
    craftable: item.craftable,
    repairable: item.repairable,
    recyclable: item.recyclable,
    researchable: item.researchable
  };
});

export const RUST_CATEGORIES = [
  'All',
  'Weapons',
  'Construction',
  'Items',
  'Resources',
  'Attire',
  'Tools',
  'Medical',
  'Food',
  'Ammo',
  'Traps',
  'Misc',
  'Components',
  'Electrical',
  'Fun',
  'Vehicles',
  'DLC / Packs'
] as const;

export function getItemIconUrl(shortname: string): string {
  return `/items/${shortname}.png`;
}

export function getItemFallbackIconUrl(shortname: string): string {
  return `https://wiki.rustclash.com/img/items180/${shortname}.png`;
}

export function getItemTertiaryIconUrl(shortname: string, iconFilename?: string): string {
  const file = iconFilename || `${shortname}.webp`;
  return `https://raw.githubusercontent.com/bobosneefdev/rust-items-json/master/data/icons/${file}`;
}
