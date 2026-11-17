import rawCommands from './allCommands.json';

export interface CommandInfo {
  command: string;
  syntax?: string;
  description: string;
  category: 'Server' | 'Oxide' | 'Plugin' | 'World' | 'Players' | 'Spawn' | 'Variable';
  args?: string[];
  presets?: string[];
}

export const COMMON_PRESETS: Record<string, string[]> = {
  'env.time': ['12', '6', '18', '0'],
  'weather.rain': ['0', '0.5', '1.0'],
  'weather.fog': ['0', '0.5', '1.0'],
  'weather.wind': ['0', '0.5', '1.0'],
  'weather.clouds': ['0', '0.5', '1.0'],
  'weather.storm': ['0', '0.5', '1.0'],
  'teleportpos': ['0 50 0', '-16 50 279', '-400 50 -100', '500 50 500'],
  'oxide.grant': ['group default', 'group admin', 'user'],
  'oxide.revoke': ['group default', 'group admin', 'user'],
  'oxide.show': ['perms', 'groups', 'group default', 'group admin'],
  'oxide.group': ['add', 'remove', 'parent', 'set'],
  'oxide.usergroup': ['add', 'remove'],
  'bgrade': ['1', '2', '3', '4', '0'],
  'up': ['1', '2', '3', '4'],
  'upall': ['1', '2', '3', '4'],
  'down': ['0', '1', '2', '3'],
  'downall': ['0', '1', '2', '3'],
  'fps.limit': ['60', '144', '240', '-1'],
  'bp.all': ['*'],
  'bp.reset': ['*'],
  'inventory.give': ['rifle.ak 1', 'ammo.rifle 128', 'largemedkit 5', 'scrap 1000'],
  'inventory.givearm': ['rifle.ak', 'largemedkit', 'jackhammer']
};

// Curated plugin commands registered by installed Oxide plugins
const PLUGIN_SPECIFIC_COMMANDS: CommandInfo[] = [
  // GatherManager
  { command: 'gather.rate', syntax: 'gather.rate <type> <multiplier>', description: 'Set resource gathering multiplier (e.g. gather.rate Resource Wood 5)', category: 'Plugin', presets: ['Resource Wood 2', 'Resource Stone 2', 'Resource Ore 2'] },
  { command: 'gather.resources', syntax: 'gather.resources', description: 'List all resource gather rate settings', category: 'Plugin' },
  { command: 'gather.dispensers', syntax: 'gather.dispensers', description: 'List resource dispenser multipliers', category: 'Plugin' },
  { command: 'dispenser.scale', syntax: 'dispenser.scale <type> <multiplier>', description: 'Scale total amount of resources inside trees/nodes/animals', category: 'Plugin' },
  { command: 'quarry.tickrate', syntax: 'quarry.tickrate <seconds>', description: 'Mining quarry cycle tickrate in seconds', category: 'Plugin', presets: ['5', '10', '15'] },
  { command: 'excavator.tickrate', syntax: 'excavator.tickrate <seconds>', description: 'Giant Excavator production tickrate in seconds', category: 'Plugin' },

  // BuildingGrades
  { command: 'bgrade', syntax: 'bgrade <1-4>', description: 'Auto-upgrade building tier on placement (1=Wood, 2=Stone, 3=Metal, 4=TopTier)', category: 'Plugin', presets: ['1 (Wood)', '2 (Stone)', '3 (Metal)', '4 (Armored)', '0 (Off)'] },
  { command: 'up', syntax: 'up <1-4>', description: 'Upgrade targeted building block to tier', category: 'Plugin', presets: ['1', '2', '3', '4'] },
  { command: 'upall', syntax: 'upall <1-4>', description: 'Upgrade entire connected base structure to tier', category: 'Plugin', presets: ['1', '2', '3', '4'] },
  { command: 'down', syntax: 'down <0-3>', description: 'Downgrade targeted building block (0=Twigs, 1=Wood, 2=Stone, 3=Metal)', category: 'Plugin', presets: ['0', '1', '2', '3'] },
  { command: 'downall', syntax: 'downall <0-3>', description: 'Downgrade entire connected base structure', category: 'Plugin', presets: ['0', '1', '2', '3'] },

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
  { command: 'stacksizecontroller.setallstacks', syntax: 'stacksizecontroller.setallstacks <multiplier>', description: 'Multiply stack sizes across every item on the server', category: 'Plugin', presets: ['2', '5', '10'] },
  { command: 'stacksizecontroller.listcategories', syntax: 'stacksizecontroller.listcategories', description: 'List all item categories configured in StackSizeController', category: 'Plugin' },

  // BlueprintManager
  { command: 'bp.all', syntax: 'bp.all <player|*>', description: 'Unlock all blueprints for a player or all (*) online players', category: 'Plugin', presets: ['*'] },
  { command: 'bp.reset', syntax: 'bp.reset <player|*>', description: 'Wipe unlocked blueprints for a player or all (*) players', category: 'Plugin', presets: ['*'] },
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

// Helper to extract argument list from a syntax string
function parseArgumentsFromSyntax(syntax?: string): string[] | undefined {
  if (!syntax) return undefined;
  const matches = syntax.match(/([<\[][^>\]]+[>\]])/g);
  return matches && matches.length > 0 ? matches : undefined;
}

// Build master list of all commands
const commandMap = new Map<string, CommandInfo>();

// 1. Add plugin specific commands with custom syntax and descriptions
for (const p of PLUGIN_SPECIFIC_COMMANDS) {
  commandMap.set(p.command.toLowerCase(), {
    ...p,
    args: parseArgumentsFromSyntax(p.syntax),
    presets: p.presets || COMMON_PRESETS[p.command]
  });
}

// 2. Add raw commands from server
for (const [command, desc] of Object.entries(rawCommands)) {
  const cleanCmd = command.replace(/\(\s*$/, '').trim();
  const lower = cleanCmd.toLowerCase();
  if (!commandMap.has(lower)) {
    const rawDesc = (desc as string) || cleanCmd;
    const cleanDesc = rawDesc.replace(/^\s*\)\s*/, '').trim();

    // Check for explicit syntax pattern: e.g. "teleportpos <x> <y> <z>" or "cmd <...>"
    let syntax: string | undefined;
    const syntaxRegex = new RegExp(`(${cleanCmd.replace(".", "\\.")}\\s+[<\\[][^:)]+)`, 'i');
    const m = cleanDesc.match(syntaxRegex);
    if (m) {
      syntax = m[1].trim();
    } else if (cleanDesc.includes('(') && cleanDesc.includes(')')) {
      const defaultVal = cleanDesc.match(/\(([^)]+)\)$/);
      if (defaultVal) {
        const val = defaultVal[1].trim();
        if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
          syntax = `${cleanCmd} <true|false>`;
        } else if (!isNaN(Number(val)) && val.length < 8) {
          syntax = `${cleanCmd} [value: ${val}]`;
        }
      }
    }

    let presets = COMMON_PRESETS[cleanCmd];
    if (!presets && syntax?.includes('<true|false>')) {
      presets = ['true', 'false'];
    }

    commandMap.set(lower, {
      command: cleanCmd,
      syntax,
      description: cleanDesc,
      category: getCategory(cleanCmd),
      args: parseArgumentsFromSyntax(syntax),
      presets
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

export function getCommandInfo(name: string): CommandInfo | undefined {
  return commandMap.get(name.trim().toLowerCase());
}
