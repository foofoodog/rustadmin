// Comprehensive In-Game Item Statistics Catalog & Facepunch Official Wiki Link Generator
// Accurately mirrors Rust game constants and wiki.facepunch.com database entries

export interface ItemStats {
  // Weapon & Tool combat/harvesting stats
  damage?: number | string;
  attackSpeed?: string;
  range?: string;
  drawTime?: string;
  throwable?: string;
  magazineSize?: number;
  reloadTime?: string;
  recoil?: string;
  velocity?: string;

  // Armor protection ratings
  projectileProtection?: string;
  meleeProtection?: string;
  biteProtection?: string;
  radiationProtection?: string;
  coldProtection?: string;
  explosionProtection?: string;

  // Medical & consumables
  instantHealth?: number;
  healthOverTime?: number;
  calories?: number;
  hydration?: number;
  bleeding?: string;
}

// Base item aliases for reskinned DLC items and common shortname redirects
export const BASE_ITEM_ALIASES: Record<string, string> = {
  // Artist Pack
  'gun.paintball': 'pistol.semiauto',
  'attire.paintball.overalls': 'hazmatsuit',

  // Storage Box Pack
  'component.box.ammo.large': 'box.wooden.large',
  'component.box.armor.large': 'box.wooden.large',
  'component.box.charcoal.large': 'box.wooden.large',
  'component.box.clothing.large': 'box.wooden.large',
  'component.box.comps.large': 'box.wooden.large',
  'component.box.explosives.large': 'box.wooden.large',
  'component.box.food.large': 'box.wooden.large',
  'component.box.guns.large': 'box.wooden.large',
  'component.box.meds.large': 'box.wooden.large',
  'component.box.metal.large': 'box.wooden.large',
  'component.box.ore.large': 'box.wooden.large',
  'component.box.scrap.large': 'box.wooden.large',
  'component.box.stone.large': 'box.wooden.large',
  'component.box.sulfur.large': 'box.wooden.large',
  'component.box.tools.large': 'box.wooden.large',
  'component.box.wood.large': 'box.wooden.large',

  // Industrial Decor Pack
  'industrial.storage.barrel.horizontal': 'box.wooden.large',
  'industrial.storage.barrel.vertical': 'box.wooden.large',

  // Jungle Pack
  'rifle.ak.jungle': 'rifle.ak',
  'knife.bone.obsidian': 'knife.bone',
  'jungle.rock': 'rock',
  'cocoknight.armor.helmet': 'wood.armor.helmet',
  'cocoknight.armor.torso': 'wood.armor.jacket',
  'cocoknight.armor.pants': 'wood.armor.pants',
  'cocoknight.armor.gloves': 'tactical.gloves',
  'bamboo.barrel': 'box.wooden.large',

  // Abyss / Diver Pack
  diverhatchet: 'hatchet',
  diverpickaxe: 'pickaxe',
  divertorch: 'torch',
  'rifle.ak.diver': 'rifle.ak',
  'hazmatsuit.diver': 'hazmatsuit',
  'abyss.barrel.horizontal': 'box.wooden.large',
  'abyss.barrel.vertical': 'box.wooden.large',

  // Arctic Pack
  'rifle.ak.ice': 'rifle.ak',
  arcticsuit: 'hazmatsuit',
  'hazmatsuit.arcticsuit': 'hazmatsuit',
  tomaha: 'hatchet',

  // Lumberjack Pack
  'lumberjack.hatchet': 'hatchet',
  'lumberjack.pickaxe': 'pickaxe',
  'lumberjack.hoodie': 'hoodie',
  'lumberjack hoodie': 'hoodie',
  'hazmatsuit.lumberjack': 'hazmatsuit',

  // Frontier Pack
  'frontier.hatchet': 'hatchet',
  frontier_hatchet: 'hatchet',
  'frontier.shotgun': 'shotgun.pump',
  'hazmatsuit.frontier': 'hazmatsuit',
  'door.double.hinged.bardoors': 'door.double.hinged.metal',

  // Sunburn DLC
  'gun.water': 'pistol.semiauto',
  'pistol.water': 'pistol.revolver',

  // Special Suits
  nomadsuit: 'hazmatsuit',
  'hazmatsuit.nomadsuit': 'hazmatsuit',
  spacesuit: 'hazmatsuit',
  'hazmatsuit.spacesuit': 'hazmatsuit',
  'hazmat.krieg': 'hazmatsuit',
  'hazmat.plague': 'hazmatsuit',
  'hazmatsuit.pilot': 'hazmatsuit',
  'hazmatsuit.kick': 'hazmatsuit',
  hazmatsuittwitch: 'hazmatsuit',

  // Ice & Special Skins
  'metal.plate.torso.icevest': 'metal.plate.torso',
  'metal.facemask.icemask': 'metal.facemask',
  'cupboard.tool.retro': 'cupboard.tool',
  'torch.torch.skull': 'torch',
};

// RustClash Wiki URL Slug Overrides
export const WIKI_SLUG_OVERRIDES: Record<string, string> = {
  'rifle.ak': 'assault-rifle',
  'rifle.bolt': 'bolt-action-rifle',
  'rifle.l96': 'l96-rifle',
  'rifle.lr300': 'lr-300-assault-rifle',
  'rifle.m39': 'm39-rifle',
  'rifle.semiauto': 'semi-automatic-rifle',
  'smg.2': 'custom-smg',
  'smg.mp5': 'mp5a4',
  'smg.thompson': 'thompson',
  'pistol.m92': 'm92-pistol',
  'pistol.python': 'python-revolver',
  'pistol.revolver': 'revolver',
  'pistol.semiauto': 'semi-automatic-pistol',
  'shotgun.double': 'double-barrel-shotgun',
  'shotgun.pump': 'pump-shotgun',
  'shotgun.spas12': 'spas-12-shotgun',
  'shotgun.waterpipe': 'waterpipe-shotgun',
  'bow.hunting': 'hunting-bow',
  'bow.compound': 'compound-bow',
  crossbow: 'crossbow',
  'rocket.launcher': 'rocket-launcher',
  grenade: 'f1-grenade',
  'grenade.beancan': 'beancan-grenade',
  'explosive.timed': 'timed-explosive-charge',
  'explosive.satchel': 'satchel-charge',
  hatchet: 'hatchet',
  pickaxe: 'pickaxe',
  'axe.salvaged': 'salvaged-axe',
  'icepick.salvaged': 'salvaged-icepick',
  'hammer.salvaged': 'salvaged-hammer',
  'stone.pickaxe': 'stone-pickaxe',
  stonehatchet: 'stone-hatchet',
  torch: 'torch',
  knife_bone: 'bone-knife',
  'knife.combat': 'combat-knife',
  machete: 'machete',
  salvaged_sword: 'salvaged-sword',
  longsword: 'longsword',
  mace: 'mace',
  spear_wooden: 'wooden-spear',
  spear_stone: 'stone-spear',
  jackhammer: 'jackhammer',
  chainsaw: 'chainsaw',
  hazmatsuit: 'hazmat-suit',
  'metal.facemask': 'metal-facemask',
  'metal.plate.torso': 'metal-chest-plate',
  'coffeecan.helmet': 'coffee-can-helmet',
  'roadsign.jacket': 'road-sign-jacket',
  'roadsign.kilt': 'road-sign-kilt',
  'roadsign.gloves': 'road-sign-gloves',
  'heavy.plate.helmet': 'heavy-plate-helmet',
  'heavy.plate.jacket': 'heavy-plate-jacket',
  'heavy.plate.pants': 'heavy-plate-pants',
  'tactical.gloves': 'tactical-gloves',
  boots: 'boots',
  pants: 'pants',
  hoodie: 'hoodie',
  'syringe.medical': 'medical-syringe',
  medkit: 'large-medkit',
  bandage: 'bandage',
  'box.wooden.large': 'large-wood-box',
  'box.wooden': 'small-wood-box'
};

// Official In-Game Stats Database
export const ITEM_STATS_DATABASE: Record<string, ItemStats> = {
  // === TOOLS & HARVESTING ===
  hatchet: {
    damage: 25,
    attackSpeed: '67 HPM',
    range: '1.5 m',
    drawTime: '1 sec',
    throwable: 'Yes',
  },
  pickaxe: {
    damage: 35,
    attackSpeed: '34 HPM',
    range: '1.6 m',
    drawTime: '1 sec',
    throwable: 'Yes',
  },
  'axe.salvaged': {
    damage: 40,
    attackSpeed: '50 HPM',
    range: '1.7 m',
    drawTime: '1 sec',
    throwable: 'Yes',
  },
  'icepick.salvaged': {
    damage: 45,
    attackSpeed: '43 HPM',
    range: '1.7 m',
    drawTime: '1 sec',
    throwable: 'Yes',
  },
  stonehatchet: {
    damage: 15,
    attackSpeed: '60 HPM',
    range: '1.4 m',
    drawTime: '0.8 sec',
    throwable: 'Yes',
  },
  'stone.pickaxe': {
    damage: 20,
    attackSpeed: '30 HPM',
    range: '1.5 m',
    drawTime: '0.8 sec',
    throwable: 'Yes',
  },
  jackhammer: {
    damage: 30,
    attackSpeed: '400 HPM',
    range: '1.8 m',
    drawTime: '1 sec',
    throwable: 'No',
  },
  chainsaw: {
    damage: 40,
    attackSpeed: '600 HPM',
    range: '2.0 m',
    drawTime: '1.2 sec',
    throwable: 'No',
  },
  torch: {
    damage: 10,
    attackSpeed: '50 HPM',
    range: '1.3 m',
    drawTime: '0.5 sec',
    throwable: 'Yes',
  },
  knife_bone: {
    damage: 16,
    attackSpeed: '90 HPM',
    range: '1.3 m',
    drawTime: '0.5 sec',
    throwable: 'Yes',
  },
  'knife.combat': {
    damage: 35,
    attackSpeed: '90 HPM',
    range: '1.4 m',
    drawTime: '0.5 sec',
    throwable: 'Yes',
  },
  salvaged_sword: {
    damage: 50,
    attackSpeed: '55 HPM',
    range: '1.8 m',
    drawTime: '0.8 sec',
    throwable: 'Yes',
  },
  machete: {
    damage: 35,
    attackSpeed: '65 HPM',
    range: '1.6 m',
    drawTime: '0.7 sec',
    throwable: 'Yes',
  },
  longsword: {
    damage: 75,
    attackSpeed: '38 HPM',
    range: '2.0 m',
    drawTime: '1 sec',
    throwable: 'Yes',
  },
  mace: {
    damage: 50,
    attackSpeed: '40 HPM',
    range: '1.6 m',
    drawTime: '0.8 sec',
    throwable: 'Yes',
  },
  spear_wooden: {
    damage: 25,
    attackSpeed: '40 HPM',
    range: '2.4 m',
    drawTime: '1 sec',
    throwable: 'Yes',
  },
  spear_stone: {
    damage: 35,
    attackSpeed: '40 HPM',
    range: '2.4 m',
    drawTime: '1 sec',
    throwable: 'Yes',
  },

  // === FIREARMS & WEAPONS ===
  'rifle.ak': {
    damage: 50,
    attackSpeed: '450 RPM',
    range: '187 m',
    drawTime: '1.6 sec',
    magazineSize: 30,
    reloadTime: '3.5 sec',
    recoil: 'Moderate',
    throwable: 'No',
  },
  'rifle.bolt': {
    damage: 90,
    attackSpeed: '35 RPM',
    range: '375 m',
    drawTime: '1.8 sec',
    magazineSize: 4,
    reloadTime: '4.8 sec',
    recoil: 'High',
    throwable: 'No',
  },
  'rifle.l96': {
    damage: 80,
    attackSpeed: '50 RPM',
    range: '750 m',
    drawTime: '1.5 sec',
    magazineSize: 5,
    reloadTime: '4.0 sec',
    recoil: 'Low',
    throwable: 'No',
  },
  'rifle.lr300': {
    damage: 40,
    attackSpeed: '500 RPM',
    range: '187 m',
    drawTime: '1.4 sec',
    magazineSize: 30,
    reloadTime: '3.2 sec',
    recoil: 'Low',
    throwable: 'No',
  },
  'rifle.m39': {
    damage: 50,
    attackSpeed: '300 RPM',
    range: '280 m',
    drawTime: '1.5 sec',
    magazineSize: 20,
    reloadTime: '3.8 sec',
    recoil: 'Moderate',
    throwable: 'No',
  },
  'rifle.semiauto': {
    damage: 40,
    attackSpeed: '343 RPM',
    range: '180 m',
    drawTime: '1.3 sec',
    magazineSize: 16,
    reloadTime: '3.4 sec',
    recoil: 'Moderate',
    throwable: 'No',
  },
  'smg.mp5': {
    damage: 35,
    attackSpeed: '600 RPM',
    range: '112 m',
    drawTime: '1.3 sec',
    magazineSize: 30,
    reloadTime: '3.0 sec',
    recoil: 'Low',
    throwable: 'No',
  },
  'smg.thompson': {
    damage: 38,
    attackSpeed: '462 RPM',
    range: '112 m',
    drawTime: '1.2 sec',
    magazineSize: 20,
    reloadTime: '2.8 sec',
    recoil: 'Low',
    throwable: 'No',
  },
  'smg.2': {
    damage: 30,
    attackSpeed: '600 RPM',
    range: '95 m',
    drawTime: '1.0 sec',
    magazineSize: 24,
    reloadTime: '2.6 sec',
    recoil: 'Very Low',
    throwable: 'No',
  },
  'pistol.m92': {
    damage: 45,
    attackSpeed: '400 RPM',
    range: '90 m',
    drawTime: '0.8 sec',
    magazineSize: 15,
    reloadTime: '2.5 sec',
    recoil: 'Low',
    throwable: 'No',
  },
  'pistol.python': {
    damage: 55,
    attackSpeed: '240 RPM',
    range: '120 m',
    drawTime: '1.0 sec',
    magazineSize: 6,
    reloadTime: '3.4 sec',
    recoil: 'High',
    throwable: 'No',
  },
  'pistol.semiauto': {
    damage: 40,
    attackSpeed: '400 RPM',
    range: '80 m',
    drawTime: '0.8 sec',
    magazineSize: 10,
    reloadTime: '2.4 sec',
    recoil: 'Moderate',
    throwable: 'No',
  },
  'pistol.revolver': {
    damage: 35,
    attackSpeed: '343 RPM',
    range: '70 m',
    drawTime: '0.7 sec',
    magazineSize: 8,
    reloadTime: '3.0 sec',
    recoil: 'Moderate',
    throwable: 'No',
  },
  'shotgun.pump': {
    damage: 210,
    attackSpeed: '60 RPM',
    range: '40 m',
    drawTime: '1.2 sec',
    magazineSize: 6,
    reloadTime: '4.5 sec',
    recoil: 'High',
    throwable: 'No',
  },
  'shotgun.double': {
    damage: 210,
    attackSpeed: '240 RPM',
    range: '35 m',
    drawTime: '1.0 sec',
    magazineSize: 2,
    reloadTime: '2.8 sec',
    recoil: 'Very High',
    throwable: 'No',
  },
  'shotgun.spas12': {
    damage: 155,
    attackSpeed: '180 RPM',
    range: '45 m',
    drawTime: '1.1 sec',
    magazineSize: 6,
    reloadTime: '4.2 sec',
    recoil: 'Moderate',
    throwable: 'No',
  },
  'shotgun.waterpipe': {
    damage: 210,
    attackSpeed: '20 RPM',
    range: '30 m',
    drawTime: '1.5 sec',
    magazineSize: 1,
    reloadTime: '4.0 sec',
    recoil: 'High',
    throwable: 'No',
  },
  'bow.hunting': {
    damage: 50,
    attackSpeed: '40 RPM',
    range: '100 m',
    drawTime: '1.0 sec',
    magazineSize: 1,
    reloadTime: '1.2 sec',
    throwable: 'No',
  },
  'bow.compound': {
    damage: 100,
    attackSpeed: '25 RPM',
    range: '150 m',
    drawTime: '2.0 sec',
    magazineSize: 1,
    reloadTime: '1.5 sec',
    throwable: 'No',
  },
  crossbow: {
    damage: 60,
    attackSpeed: '30 RPM',
    range: '120 m',
    drawTime: '1.2 sec',
    magazineSize: 1,
    reloadTime: '2.4 sec',
    throwable: 'No',
  },
  'rocket.launcher': {
    damage: 350,
    attackSpeed: '15 RPM',
    range: '300 m',
    drawTime: '2.0 sec',
    magazineSize: 1,
    reloadTime: '5.0 sec',
    throwable: 'No',
  },
  'lmg.m249': {
    damage: 65,
    attackSpeed: '500 RPM',
    range: '300 m',
    drawTime: '2.5 sec',
    magazineSize: 100,
    reloadTime: '6.0 sec',
    throwable: 'No',
  },
  hmlmg: {
    damage: 55,
    attackSpeed: '480 RPM',
    range: '220 m',
    drawTime: '2.2 sec',
    magazineSize: 60,
    reloadTime: '5.5 sec',
    throwable: 'No',
  },

  // === ATTIRE & ARMOR ===
  'metal.facemask': {
    projectileProtection: '50%',
    meleeProtection: '50%',
    biteProtection: '15%',
    radiationProtection: '7%',
    coldProtection: '-8°C',
    explosionProtection: '17%',
  },
  'metal.plate.torso': {
    projectileProtection: '50%',
    meleeProtection: '50%',
    biteProtection: '15%',
    radiationProtection: '8%',
    coldProtection: '-8°C',
    explosionProtection: '17%',
  },
  'coffeecan.helmet': {
    projectileProtection: '35%',
    meleeProtection: '35%',
    biteProtection: '10%',
    radiationProtection: '4%',
    coldProtection: '-5°C',
    explosionProtection: '12%',
  },
  'roadsign.jacket': {
    projectileProtection: '25%',
    meleeProtection: '25%',
    biteProtection: '10%',
    radiationProtection: '5%',
    coldProtection: '-5°C',
    explosionProtection: '10%',
  },
  'roadsign.kilt': {
    projectileProtection: '25%',
    meleeProtection: '25%',
    biteProtection: '10%',
    radiationProtection: '5%',
    coldProtection: '-5°C',
    explosionProtection: '10%',
  },
  'roadsign.gloves': {
    projectileProtection: '20%',
    meleeProtection: '20%',
    biteProtection: '10%',
    radiationProtection: '3%',
    coldProtection: '-3°C',
    explosionProtection: '8%',
  },
  'heavy.plate.helmet': {
    projectileProtection: '90%',
    meleeProtection: '90%',
    biteProtection: '30%',
    radiationProtection: '10%',
    coldProtection: '-10°C',
    explosionProtection: '25%',
  },
  'heavy.plate.jacket': {
    projectileProtection: '75%',
    meleeProtection: '75%',
    biteProtection: '25%',
    radiationProtection: '10%',
    coldProtection: '-10°C',
    explosionProtection: '25%',
  },
  'heavy.plate.pants': {
    projectileProtection: '75%',
    meleeProtection: '75%',
    biteProtection: '25%',
    radiationProtection: '10%',
    coldProtection: '-10°C',
    explosionProtection: '25%',
  },
  'tactical.gloves': {
    projectileProtection: '10%',
    meleeProtection: '10%',
    biteProtection: '5%',
    radiationProtection: '2%',
    coldProtection: '5°C',
    explosionProtection: '5%',
  },
  hazmatsuit: {
    projectileProtection: '30%',
    meleeProtection: '30%',
    biteProtection: '8%',
    radiationProtection: '50%',
    coldProtection: '8°C',
    explosionProtection: '5%',
  },
  hoodie: {
    projectileProtection: '15%',
    meleeProtection: '15%',
    biteProtection: '5%',
    radiationProtection: '5%',
    coldProtection: '10°C',
    explosionProtection: '5%',
  },
  pants: {
    projectileProtection: '15%',
    meleeProtection: '15%',
    biteProtection: '5%',
    radiationProtection: '5%',
    coldProtection: '10°C',
    explosionProtection: '5%',
  },
  boots: {
    projectileProtection: '15%',
    meleeProtection: '15%',
    biteProtection: '5%',
    radiationProtection: '3%',
    coldProtection: '8°C',
    explosionProtection: '5%',
  },

  // === MEDICAL & FOOD ===
  'syringe.medical': {
    instantHealth: 15,
    healthOverTime: 20,
    drawTime: '0.5 sec',
  },
  medkit: {
    instantHealth: 10,
    healthOverTime: 100,
    bleeding: '-100%',
    drawTime: '1 sec',
  },
  bandage: {
    instantHealth: 5,
    bleeding: '-100%',
    drawTime: '0.3 sec',
  },
  'meat.pork.cooked': {
    instantHealth: 10,
    calories: 100,
    hydration: 10,
  },
  pumpkin: {
    instantHealth: 10,
    calories: 100,
    hydration: 30,
  },
};

// Retrieve stats for any item or reskinned DLC variant
export function getItemStats(shortname: string): ItemStats | null {
  const cleanShortname = shortname.toLowerCase();
  
  // Direct match
  if (ITEM_STATS_DATABASE[cleanShortname]) {
    return ITEM_STATS_DATABASE[cleanShortname];
  }

  // Check alias / base item for DLC reskins
  const baseShortname = BASE_ITEM_ALIASES[cleanShortname];
  if (baseShortname && ITEM_STATS_DATABASE[baseShortname]) {
    return ITEM_STATS_DATABASE[baseShortname];
  }

  return null;
}

// Generate the direct wiki.facepunch.com URL for any item (resolving DLC reskins to base items)
export function getFacepunchWikiUrl(shortname: string, name?: string): string {
  const cleanShortname = shortname.toLowerCase();

  // Resolve DLC variants to their base item if needed
  const resolvedShortname = BASE_ITEM_ALIASES[cleanShortname] || cleanShortname;

  return `https://wiki.facepunch.com/rust/item/${encodeURIComponent(resolvedShortname)}`;
}

// Aliases for clean importing
export const getItemWikiUrl = getFacepunchWikiUrl;
export const getRustClashWikiUrl = getFacepunchWikiUrl;
