import rawCommands from './allCommands.json';

export interface CommandInfo {
  command: string;
  syntax?: string;
  description: string;
  category: 'Server' | 'Oxide' | 'Plugin' | 'World' | 'Players' | 'Spawn' | 'Variable';
}

// Curated plugin commands registered by installed Oxide plugins
const PLUGIN_SPECIFIC_COMMANDS: CommandInfo[] = [
  // GatherManager
  { command: 'gather.rate', syntax: 'gather.rate <type> <multiplier>', description: 'Set resource gathering multiplier (e.g. gather.rate Resource Wood 5)', category: 'Plugin' },
  { command: 'gather.resources', syntax: 'gather.resources', description: 'List all resource gather rate settings', category: 'Plugin' },
  { command: 'gather.dispensers', syntax: 'gather.dispensers', description: 'List resource dispenser multipliers', category: 'Plugin' },
  { command: 'dispenser.scale', syntax: 'dispenser.scale <type> <multiplier>', description: 'Scale total amount of resources inside trees/nodes/animals', category: 'Plugin' },
  { command: 'quarry.tickrate', syntax: 'quarry.tickrate <seconds>', description: 'Mining quarry cycle tickrate in seconds', category: 'Plugin' },
  { command: 'excavator.tickrate', syntax: 'excavator.tickrate <seconds>', description: 'Giant Excavator production tickrate in seconds', category: 'Plugin' },

  // BuildingGrades
  { command: 'bgrade', syntax: 'bgrade <1-4>', description: 'Auto-upgrade building tier on placement (1=Wood, 2=Stone, 3=Metal, 4=TopTier)', category: 'Plugin' },
  { command: 'up', syntax: 'up <1-4>', description: 'Upgrade targeted building block to tier', category: 'Plugin' },
  { command: 'upall', syntax: 'upall <1-4>', description: 'Upgrade entire connected base structure to tier', category: 'Plugin' },
  { command: 'down', syntax: 'down <0-3>', description: 'Downgrade targeted building block (0=Twigs, 1=Wood, 2=Stone, 3=Metal)', category: 'Plugin' },
  { command: 'downall', syntax: 'downall <0-3>', description: 'Downgrade entire connected base structure', category: 'Plugin' },

  // CopyPaste
  { command: 'copy', syntax: 'copy <filename>', description: 'Copy targeted building structure into a save file', category: 'Plugin' },
  { command: 'paste', syntax: 'paste <filename>', description: 'Paste saved building structure at crosshair location', category: 'Plugin' },
  { command: 'pasteback', syntax: 'pasteback <filename>', description: 'Paste structure back into its original coordinates', category: 'Plugin' },
  { command: 'undo', syntax: 'undo', description: 'Undo the last pasted structure', category: 'Plugin' },

  // Kits
  { command: 'kit', syntax: 'kit <name>', description: 'Redeem or open kits UI', category: 'Plugin' },
  { command: 'kits.create', syntax: 'kits.create <name>', description: 'Create a new kit using current inventory items', category: 'Plugin' },
  { command: 'kits.edit', syntax: 'kits.edit <name>', description: 'Edit existing kit settings and cooldowns', category: 'Plugin' },
  { command: 'kits.gridview', syntax: 'kits.gridview', description: 'Toggle between kit grid and list view UI', category: 'Plugin' },
  { command: 'kits.clearitems', syntax: 'kits.clearitems <name>', description: 'Wipe all items stored in a kit', category: 'Plugin' },
  { command: 'kits.copyinv', syntax: 'kits.copyinv <name>', description: 'Copy admin inventory directly into an existing kit', category: 'Plugin' },

  // BuildRace
  { command: 'race.start', syntax: 'race.start', description: 'Start the Build Race event, wipe entities and notify players', category: 'Plugin' },
  { command: 'race.end', syntax: 'race.end', description: 'End the Build Race event immediately', category: 'Plugin' },
  { command: 'race.status', syntax: 'race.status', description: 'Check remaining required build race items and leaderboard', category: 'Plugin' },
  { command: 'race.debug', syntax: 'race.debug', description: 'Print debug info for race tracker entities', category: 'Plugin' },

  // StackSizeController
  { command: 'stacksizecontroller.setstack', syntax: 'stacksizecontroller.setstack <shortname> <amount>', description: 'Set maximum stack size for an item', category: 'Plugin' },
  { command: 'stacksizecontroller.setstackcat', syntax: 'stacksizecontroller.setstackcat <category> <multiplier>', description: 'Multiply all stack sizes in an item category', category: 'Plugin' },
  { command: 'stacksizecontroller.setallstacks', syntax: 'stacksizecontroller.setallstacks <multiplier>', description: 'Multiply stack sizes across every item on the server', category: 'Plugin' },
  { command: 'stacksizecontroller.listcategories', syntax: 'stacksizecontroller.listcategories', description: 'List all item categories configured in StackSizeController', category: 'Plugin' },

  // BlueprintManager
  { command: 'bp.all', syntax: 'bp.all <player|*>', description: 'Unlock all blueprints for a player or all (*) online players', category: 'Plugin' },
  { command: 'bp.reset', syntax: 'bp.reset <player|*>', description: 'Wipe unlocked blueprints for a player or all (*) players', category: 'Plugin' },
];

const getCategory = (cmd: string): CommandInfo['category'] => {
  if (cmd.startsWith('oxide.') || ['plugins', 'load', 'unload', 'reload', 'grant', 'revoke', 'group', 'usergroup', 'show'].includes(cmd)) {
    return 'Oxide';
  }
  if (PLUGIN_SPECIFIC_COMMANDS.some(p => p.command === cmd)) {
    return 'Plugin';
  }
  if (['kick', 'ban', 'unban', 'banlist', 'mute', 'unmute', 'teleport', 'teleport2me', 'teleportpos', 'playerlist', 'playerlistpos'].includes(cmd)) {
    return 'Players';
  }
  if (['spawn', 'supply.call', 'inventory.give', 'inventory.giveid', 'inventory.giveall', 'inventory.givearm', 'heli.call', 'heli.strafe', 'heli.drop'].includes(cmd)) {
    return 'Spawn';
  }
  if (cmd.startsWith('env.') || cmd.startsWith('weather.')) {
    return 'World';
  }
  if (['status', 'serverinfo', 'server.save', 'restart', 'say', 'fps.limit', 'entity.deleteby'].includes(cmd) || cmd.startsWith('server.')) {
    return 'Server';
  }
  return 'Variable';
};

// Build master list of all commands
const commandMap = new Map<string, CommandInfo>();

// 1. Add plugin specific commands with custom syntax and descriptions
for (const p of PLUGIN_SPECIFIC_COMMANDS) {
  commandMap.set(p.command.toLowerCase(), p);
}

// 2. Add raw commands from server
for (const [command, desc] of Object.entries(rawCommands)) {
  const cleanCmd = command.replace(/\(\s*$/, '').trim();
  const lower = cleanCmd.toLowerCase();
  if (!commandMap.has(lower)) {
    const rawDesc = (desc as string) || cleanCmd;
    const cleanDesc = rawDesc.replace(/^\s*\)\s*/, '').trim();
    commandMap.set(lower, {
      command: cleanCmd,
      description: cleanDesc,
      category: getCategory(cleanCmd),
    });
  }
}

const PRIORITY_PREFIXES = ['oxide.', 'gather.', 'kits.', 'bgrade', 'upall', 'copy', 'paste', 'race.', 'stacksize', 'server.', 'weather.', 'env.', 'inventory.', 'teleport', 'status', 'plugins', 'kick', 'ban', 'restart', 'say', 'spawn'];

export const CONSOLE_COMMANDS: CommandInfo[] = Array.from(commandMap.values()).sort((a, b) => {
  const aPrio = PRIORITY_PREFIXES.some(p => a.command.toLowerCase().startsWith(p) || a.command.toLowerCase() === p);
  const bPrio = PRIORITY_PREFIXES.some(p => b.command.toLowerCase().startsWith(p) || b.command.toLowerCase() === p);
  if (aPrio && !bPrio) return -1;
  if (!aPrio && bPrio) return 1;
  return a.command.localeCompare(b.command);
});
