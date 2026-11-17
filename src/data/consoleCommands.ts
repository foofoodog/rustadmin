import rawCommands from './allCommands.json';

export interface CommandInfo {
  command: string;
  syntax?: string;
  description: string;
  category: 'Server' | 'Oxide' | 'World' | 'Players' | 'Spawn' | 'Variable';
}

const getCategory = (cmd: string): CommandInfo['category'] => {
  if (cmd.startsWith('oxide.') || ['plugins', 'load', 'unload', 'reload', 'grant', 'revoke', 'group', 'usergroup', 'show'].includes(cmd)) {
    return 'Oxide';
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

// Build list of all commands
export const ALL_COMMANDS: CommandInfo[] = Object.entries(rawCommands).map(([command, desc]) => {
  return {
    command,
    description: (desc as string) || command,
    category: getCategory(command),
  };
});

// Sort with priority commands first
const PRIORITY_PREFIXES = ['oxide.', 'server.', 'weather.', 'env.', 'inventory.', 'teleport', 'status', 'plugins', 'kick', 'ban', 'restart', 'say', 'spawn'];

export const CONSOLE_COMMANDS: CommandInfo[] = [...ALL_COMMANDS].sort((a, b) => {
  const aPrio = PRIORITY_PREFIXES.some(p => a.command.startsWith(p) || a.command === p);
  const bPrio = PRIORITY_PREFIXES.some(p => b.command.startsWith(p) || b.command === p);
  if (aPrio && !bPrio) return -1;
  if (!aPrio && bPrio) return 1;
  return a.command.localeCompare(b.command);
});
