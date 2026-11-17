export interface RustItem {
  name: string;
  shortname: string;
  category: 'Weapons' | 'Ammo' | 'Medical' | 'Resources' | 'Construction' | 'Deployables' | 'Tools' | 'Electrical' | 'Vehicles';
  defaultAmount?: number;
  description?: string;
}

export const RUST_ITEMS: RustItem[] = [
  // Weapons
  { name: 'Assault Rifle (AK-47)', shortname: 'rifle.ak', category: 'Weapons', defaultAmount: 1 },
  { name: 'Bolt Action Rifle', shortname: 'rifle.bolt', category: 'Weapons', defaultAmount: 1 },
  { name: 'L96 Sniper', shortname: 'rifle.l96', category: 'Weapons', defaultAmount: 1 },
  { name: 'LR-300 Assault Rifle', shortname: 'rifle.lr300', category: 'Weapons', defaultAmount: 1 },
  { name: 'Semi-Automatic Rifle (SAR)', shortname: 'rifle.semiauto', category: 'Weapons', defaultAmount: 1 },
  { name: 'MP5A4', shortname: 'smg.mp5', category: 'Weapons', defaultAmount: 1 },
  { name: 'Thompson', shortname: 'smg.thompson', category: 'Weapons', defaultAmount: 1 },
  { name: 'Custom SMG', shortname: 'smg.2', category: 'Weapons', defaultAmount: 1 },
  { name: 'M39 Rifle', shortname: 'rifle.m39', category: 'Weapons', defaultAmount: 1 },
  { name: 'M249 Light Machine Gun', shortname: 'lmg.m249', category: 'Weapons', defaultAmount: 1 },
  { name: 'HMLMG', shortname: 'hmlmg', category: 'Weapons', defaultAmount: 1 },
  { name: 'Pump Shotgun', shortname: 'shotgun.pump', category: 'Weapons', defaultAmount: 1 },
  { name: 'SPAS-12 Shotgun', shortname: 'shotgun.spas12', category: 'Weapons', defaultAmount: 1 },
  { name: 'Double Barrel Shotgun', shortname: 'shotgun.double', category: 'Weapons', defaultAmount: 1 },
  { name: 'Rocket Launcher', shortname: 'rocket.launcher', category: 'Weapons', defaultAmount: 1 },
  { name: 'Multiple Grenade Launcher', shortname: 'multiplegrenadelauncher', category: 'Weapons', defaultAmount: 1 },
  { name: 'Compound Bow', shortname: 'bow.compound', category: 'Weapons', defaultAmount: 1 },
  { name: 'Hunting Bow', shortname: 'bow.hunting', category: 'Weapons', defaultAmount: 1 },
  { name: 'Crossbow', shortname: 'crossbow', category: 'Weapons', defaultAmount: 1 },

  // Ammunition
  { name: '5.56 Rifle Ammo', shortname: 'ammo.rifle', category: 'Ammo', defaultAmount: 128 },
  { name: 'Explosive 5.56 Rifle Ammo', shortname: 'ammo.rifle.explosive', category: 'Ammo', defaultAmount: 128 },
  { name: 'HV 5.56 Rifle Ammo', shortname: 'ammo.rifle.hv', category: 'Ammo', defaultAmount: 128 },
  { name: 'Incendiary 5.56 Rifle Ammo', shortname: 'ammo.rifle.incendiary', category: 'Ammo', defaultAmount: 128 },
  { name: 'Pistol Ammo', shortname: 'ammo.pistol', category: 'Ammo', defaultAmount: 128 },
  { name: 'HV Pistol Ammo', shortname: 'ammo.pistol.hv', category: 'Ammo', defaultAmount: 128 },
  { name: '12 Gauge Buckshot', shortname: 'ammo.shotgun', category: 'Ammo', defaultAmount: 64 },
  { name: '12 Gauge Slug', shortname: 'ammo.shotgun.slug', category: 'Ammo', defaultAmount: 64 },
  { name: 'Rocket', shortname: 'ammo.rocket.basic', category: 'Ammo', defaultAmount: 10 },
  { name: 'High Velocity Rocket', shortname: 'ammo.rocket.hv', category: 'Ammo', defaultAmount: 10 },
  { name: 'Incendiary Rocket', shortname: 'ammo.rocket.fire', category: 'Ammo', defaultAmount: 10 },
  { name: 'Timed Explosive Charge (C4)', shortname: 'explosive.timed', category: 'Ammo', defaultAmount: 10 },
  { name: 'Satchel Charge', shortname: 'explosive.satchel', category: 'Ammo', defaultAmount: 10 },
  { name: 'F1 Grenade', shortname: 'grenade.f1', category: 'Ammo', defaultAmount: 10 },

  // Medical
  { name: 'Medical Syringe', shortname: 'syringe.medical', category: 'Medical', defaultAmount: 10 },
  { name: 'Large Medkit', shortname: 'medkit', category: 'Medical', defaultAmount: 5 },
  { name: 'Bandage', shortname: 'bandage', category: 'Medical', defaultAmount: 10 },
  { name: 'Anti-Radiation Pills', shortname: 'antiradpills', category: 'Medical', defaultAmount: 10 },

  // Resources
  { name: 'Scrap', shortname: 'scrap', category: 'Resources', defaultAmount: 1000 },
  { name: 'Wood', shortname: 'wood', category: 'Resources', defaultAmount: 5000 },
  { name: 'Stones', shortname: 'stones', category: 'Resources', defaultAmount: 5000 },
  { name: 'Metal Fragments', shortname: 'metal.fragments', category: 'Resources', defaultAmount: 5000 },
  { name: 'High Quality Metal', shortname: 'metal.refined', category: 'Resources', defaultAmount: 500 },
  { name: 'Sulfur', shortname: 'sulfur', category: 'Resources', defaultAmount: 2000 },
  { name: 'Gunpowder', shortname: 'gunpowder', category: 'Resources', defaultAmount: 2000 },
  { name: 'Explosives', shortname: 'explosives', category: 'Resources', defaultAmount: 100 },
  { name: 'Low Grade Fuel', shortname: 'lowgradefuel', category: 'Resources', defaultAmount: 1000 },
  { name: 'Cloth', shortname: 'cloth', category: 'Resources', defaultAmount: 1000 },
  { name: 'Leather', shortname: 'leather', category: 'Resources', defaultAmount: 500 },
  { name: 'Crude Oil', shortname: 'crude.oil', category: 'Resources', defaultAmount: 500 },
  { name: 'Charcoal', shortname: 'charcoal', category: 'Resources', defaultAmount: 5000 },

  // Construction
  { name: 'Building Plan', shortname: 'building.planner', category: 'Construction', defaultAmount: 1 },
  { name: 'Hammer', shortname: 'hammer', category: 'Construction', defaultAmount: 1 },
  { name: 'Armored Door', shortname: 'door.hinged.toptier', category: 'Construction', defaultAmount: 1 },
  { name: 'Sheet Metal Door', shortname: 'door.hinged.metal', category: 'Construction', defaultAmount: 1 },
  { name: 'Armored Double Door', shortname: 'door.double.hinged.toptier', category: 'Construction', defaultAmount: 1 },
  { name: 'Sheet Metal Double Door', shortname: 'door.double.hinged.metal', category: 'Construction', defaultAmount: 1 },
  { name: 'Garage Door', shortname: 'wall.frame.garagedoor', category: 'Construction', defaultAmount: 1 },
  { name: 'Code Lock', shortname: 'lock.code', category: 'Construction', defaultAmount: 5 },
  { name: 'High External Stone Wall', shortname: 'wall.external.high.stone', category: 'Construction', defaultAmount: 10 },
  { name: 'High External Stone Gate', shortname: 'gates.external.high.stone', category: 'Construction', defaultAmount: 2 },
  { name: 'Keycard (Green)', shortname: 'keycard_green', category: 'Construction', defaultAmount: 1 },
  { name: 'Keycard (Blue)', shortname: 'keycard_blue', category: 'Construction', defaultAmount: 1 },
  { name: 'Keycard (Red)', shortname: 'keycard_red', category: 'Construction', defaultAmount: 1 },

  // Deployables
  { name: 'Workbench Level 3', shortname: 'workbench3', category: 'Deployables', defaultAmount: 1 },
  { name: 'Workbench Level 2', shortname: 'workbench2', category: 'Deployables', defaultAmount: 1 },
  { name: 'Workbench Level 1', shortname: 'workbench1', category: 'Deployables', defaultAmount: 1 },
  { name: 'Research Table', shortname: 'research.table', category: 'Deployables', defaultAmount: 1 },
  { name: 'Repair Bench', shortname: 'box.repair.bench', category: 'Deployables', defaultAmount: 1 },
  { name: 'Large Furnace', shortname: 'furnace.large', category: 'Deployables', defaultAmount: 1 },
  { name: 'Furnace', shortname: 'furnace', category: 'Deployables', defaultAmount: 1 },
  { name: 'Auto Turret', shortname: 'autoturret', category: 'Deployables', defaultAmount: 1 },
  { name: 'SAM Site', shortname: 'samsite', category: 'Deployables', defaultAmount: 1 },
  { name: 'Large Wood Box', shortname: 'box.wooden.large', category: 'Deployables', defaultAmount: 5 },
  { name: 'Sleeping Bag', shortname: 'sleepingbag', category: 'Deployables', defaultAmount: 5 },
  { name: 'Bed', shortname: 'bed', category: 'Deployables', defaultAmount: 1 },

  // Tools
  { name: 'Jackhammer', shortname: 'jackhammer', category: 'Tools', defaultAmount: 1 },
  { name: 'Chainsaw', shortname: 'chainsaw', category: 'Tools', defaultAmount: 1 },
  { name: 'Salvaged Icepick', shortname: 'icepick.salvaged', category: 'Tools', defaultAmount: 1 },
  { name: 'Salvaged Axe', shortname: 'axe.salvaged', category: 'Tools', defaultAmount: 1 },
  { name: 'Metal Pickaxe', shortname: 'pickaxe', category: 'Tools', defaultAmount: 1 },
  { name: 'Metal Hatchet', shortname: 'hatchet', category: 'Tools', defaultAmount: 1 },

  // Electrical
  { name: 'Large Rechargeable Battery', shortname: 'electric.battery.rechargeable.large', category: 'Electrical', defaultAmount: 1 },
  { name: 'Wind Turbine', shortname: 'generator.wind.scrap', category: 'Electrical', defaultAmount: 1 },
  { name: 'Large Solar Panel', shortname: 'electric.solarpanel.large', category: 'Electrical', defaultAmount: 2 },
  { name: 'Switch', shortname: 'electric.switch', category: 'Electrical', defaultAmount: 5 },
  { name: 'Wire Tool', shortname: 'wiretool', category: 'Electrical', defaultAmount: 1 },
  { name: 'RF Transmitter', shortname: 'rf.transmitter', category: 'Electrical', defaultAmount: 1 },
  { name: 'RF Receiver', shortname: 'rf_receiver', category: 'Electrical', defaultAmount: 1 },

  // Vehicles
  { name: 'Minicopter (Prefab)', shortname: 'minicopter', category: 'Vehicles', defaultAmount: 1 },
  { name: 'Scrap Transport Helicopter', shortname: 'scraptransporthelicopter', category: 'Vehicles', defaultAmount: 1 },
  { name: 'Attack Helicopter', shortname: 'attackhelicopter', category: 'Vehicles', defaultAmount: 1 },
  { name: 'Rowboat', shortname: 'rowboat', category: 'Vehicles', defaultAmount: 1 },
  { name: 'RHIB (Rigid Hull Boat)', shortname: 'rhib', category: 'Vehicles', defaultAmount: 1 },
  { name: 'Tugboat', shortname: 'tugboat', category: 'Vehicles', defaultAmount: 1 },
  { name: 'Solo Submarine', shortname: 'submarinesolo', category: 'Vehicles', defaultAmount: 1 },
];

export function getItemIconUrl(shortname: string): string {
  return `https://wiki.rustclash.com/img/items180/${shortname}.png`;
}
