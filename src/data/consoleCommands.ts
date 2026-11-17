export interface CommandInfo {
  command: string;
  syntax?: string;
  description: string;
  category: 'Server' | 'Oxide' | 'World' | 'Players' | 'Spawn' | 'Economy';
}

export const CONSOLE_COMMANDS: CommandInfo[] = [
  // Server & System
  { command: 'status', syntax: 'status', description: 'Print server status, players, and map info', category: 'Server' },
  { command: 'serverinfo', syntax: 'serverinfo', description: 'Detailed server performance and networking metrics', category: 'Server' },
  { command: 'server.save', syntax: 'server.save', description: 'Force save the current world state to disk', category: 'Server' },
  { command: 'restart', syntax: 'restart <seconds>', description: 'Initiate a restart countdown with server broadcast (0 to cancel)', category: 'Server' },
  { command: 'fps.limit', syntax: 'fps.limit <number>', description: 'Set server tick / frame rate ceiling', category: 'Server' },
  { command: 'say', syntax: 'say "<message>"', description: 'Broadcast a global chat message as [SERVER]', category: 'Server' },
  { command: 'entity.deleteby', syntax: 'entity.deleteby <name>', description: 'Delete all spawned entities matching a name or prefab', category: 'Server' },
  { command: 'server.hostname', syntax: 'server.hostname "<name>"', description: 'Change visible server title in server browser', category: 'Server' },
  { command: 'server.description', syntax: 'server.description "<text>"', description: 'Set connection screen server description', category: 'Server' },

  // Oxide / uMod
  { command: 'plugins', syntax: 'plugins', description: 'List all loaded and unloaded Oxide plugins with memory usage', category: 'Oxide' },
  { command: 'oxide.reload', syntax: 'oxide.reload <name|*>', description: 'Reload an individual plugin or all (*) plugins', category: 'Oxide' },
  { command: 'oxide.unload', syntax: 'oxide.unload <name>', description: 'Unload a plugin from memory', category: 'Oxide' },
  { command: 'oxide.load', syntax: 'oxide.load <name>', description: 'Load a plugin from oxide/plugins directory', category: 'Oxide' },
  { command: 'oxide.version', syntax: 'oxide.version', description: 'Display installed Oxide.Rust version and branch', category: 'Oxide' },
  { command: 'oxide.grant', syntax: 'oxide.grant <user|group> <name> <permission>', description: 'Grant permission to a user or group', category: 'Oxide' },
  { command: 'oxide.revoke', syntax: 'oxide.revoke <user|group> <name> <permission>', description: 'Revoke permission from user or group', category: 'Oxide' },
  { command: 'oxide.show', syntax: 'oxide.show <perms|groups|user|group>', description: 'Inspect permissions and group memberships', category: 'Oxide' },

  // World & Weather
  { command: 'env.time', syntax: 'env.time <0-24>', description: 'Set server time of day (e.g. 12 for noon, 0 for midnight)', category: 'World' },
  { command: 'weather.rain', syntax: 'weather.rain <0.0-1.0>', description: 'Set rain intensity (0 = none, 1 = heavy storm)', category: 'World' },
  { command: 'weather.fog', syntax: 'weather.fog <0.0-1.0>', description: 'Set fog density', category: 'World' },
  { command: 'weather.storm', syntax: 'weather.storm <0.0-1.0>', description: 'Trigger lightning and thunder storm', category: 'World' },
  { command: 'weather.wind', syntax: 'weather.wind <0.0-1.0>', description: 'Set wind speed and direction forces', category: 'World' },
  { command: 'weather.clouds', syntax: 'weather.clouds <0.0-1.0>', description: 'Set sky cloud cover', category: 'World' },
  { command: 'weather.reset', syntax: 'weather.reset', description: 'Reset all weather layers to default procedural cycle', category: 'World' },

  // Players & Moderation
  { command: 'playerlist', syntax: 'playerlist', description: 'List all connected players in JSON format', category: 'Players' },
  { command: 'playerlistpos', syntax: 'playerlistpos', description: 'List player SteamIDs, names, and XYZ world coordinates', category: 'Players' },
  { command: 'kick', syntax: 'kick "<steamid|name>" "<reason>"', description: 'Disconnect a player from the server', category: 'Players' },
  { command: 'ban', syntax: 'ban "<steamid|name>" "<reason>"', description: 'Permanently ban a player', category: 'Players' },
  { command: 'unban', syntax: 'unban "<steamid>"', description: 'Remove a ban for a SteamID', category: 'Players' },
  { command: 'banlist', syntax: 'banlist', description: 'Display all banned users', category: 'Players' },
  { command: 'mute', syntax: 'mute "<steamid|name>"', description: 'Mute player text chat', category: 'Players' },
  { command: 'unmute', syntax: 'unmute "<steamid|name>"', description: 'Restore player chat ability', category: 'Players' },
  { command: 'teleport', syntax: 'teleport "<player>" "<target>"', description: 'Teleport player A to player B', category: 'Players' },
  { command: 'teleport2me', syntax: 'teleport2me "<player>"', description: 'Bring target player to admin location', category: 'Players' },
  { command: 'teleportpos', syntax: 'teleportpos <x> <y> <z>', description: 'Teleport to exact XYZ map coordinates', category: 'Players' },

  // Spawning & Items
  { command: 'spawn', syntax: 'spawn <prefab>', description: 'Spawn an entity at the admin crosshair (e.g. heli, cargoship, bradley)', category: 'Spawn' },
  { command: 'supply.call', syntax: 'supply.call', description: 'Call an airdrop cargo plane to your current position', category: 'Spawn' },
  { command: 'inventory.give', syntax: 'inventory.give "<item>" <amount>', description: 'Give items to admin inventory', category: 'Spawn' },
  { command: 'inventory.giveid', syntax: 'inventory.giveid "<steamid>" "<item>" <amount>', description: 'Give items to a specific player SteamID', category: 'Spawn' },
  { command: 'inventory.giveall', syntax: 'inventory.giveall "<item>" <amount>', description: 'Give an item to every player currently on the server', category: 'Spawn' },
  { command: 'heli.call', syntax: 'heli.call', description: 'Call the Patrol Helicopter event', category: 'Spawn' },
  { command: 'heli.strafe', syntax: 'heli.strafe', description: 'Order patrol heli to strafe current position', category: 'Spawn' },
];
