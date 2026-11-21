import { RconMessage, ServerStatus, Player, OxidePlugin, ChatMessage, FeedEvent } from '../types/rcon';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
type Listener<T> = (data: T) => void;

class RconService {
  private ws: WebSocket | null = null;
  private messageCounter = 1000;
  private pendingRequests = new Map<number, (response: RconMessage) => void>();
  private stateListeners: Listener<ConnectionState>[] = [];
  private logListeners: Listener<RconMessage>[] = [];
  private logHistory: RconMessage[] = [];
  private chatListeners: Listener<ChatMessage>[] = [];
  private chatHistory: ChatMessage[] = [];
  private combatListeners: Listener<FeedEvent>[] = [];
  private combatHistory: FeedEvent[] = [];
  private statusListeners: Listener<ServerStatus>[] = [];
  private playersListeners: Listener<Player[]>[] = [];
  private pluginsListeners: Listener<OxidePlugin[]>[] = [];
  private permissionChangeListeners: (() => void)[] = [];
  private silentRequests = new Set<number>();

  private connectionState: ConnectionState = 'disconnected';
  private pollTimer: number | null = null;
  private currentHost = '';
  private currentPort = 28016;
  private currentPassword = '';
  private serverSeed = '1584212361';
  private serverWorldSize = 2500;
  private lastStatus: ServerStatus | null = null;

  public getState(): ConnectionState {
    return this.connectionState;
  }

  public connect(host: string, port: number, password: string) {
    const uri = `ws://${host}:${port}/${password}`;

    // If already connected or connecting to the same endpoint, don't recreate
    if (
      this.ws &&
      this.currentHost === host &&
      this.currentPort === port &&
      this.currentPassword === password &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.currentHost = host;
    this.currentPort = port;
    this.currentPassword = password;

    if (this.ws) {
      const oldWs = this.ws;
      this.ws = null;
      // Detach listeners so close/error events from the old socket don't affect state
      oldWs.onopen = null;
      oldWs.onmessage = null;
      oldWs.onerror = null;
      oldWs.onclose = null;
      try {
        oldWs.close();
      } catch (e) {
        // ignore
      }
    }

    this.setState('connecting');

    try {
      const socket = new WebSocket(uri);
      this.ws = socket;

        socket.onopen = () => {
        if (this.ws !== socket) return;
        this.setState('connected');
        this.startPolling();
        // Initial queries (silent so console isn't flooded on connect)
        this.sendCommand('status', true);
        this.sendCommand('plugins', true);
        this.sendCommand('server.seed', true);
        this.sendCommand('server.worldsize', true);
      };

      socket.onmessage = (event) => {
        if (this.ws !== socket) return;
        try {
          const data: RconMessage = JSON.parse(event.data);
          data.timestamp = Date.now();
          this.handleMessage(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err, event.data);
        }
      };

      socket.onerror = (err) => {
        if (this.ws !== socket) return;
        console.error('WebSocket Error:', err);
        this.setState('error');
      };

      socket.onclose = () => {
        if (this.ws !== socket) return;
        this.setState('disconnected');
        this.stopPolling();
        this.rejectAllPending();
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      this.setState('error');
    }
  }

  public disconnect() {
    this.stopPolling();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState('disconnected');
  }

  private setState(state: ConnectionState) {
    this.connectionState = state;
    this.stateListeners.forEach((l) => l(state));
  }

  private startPolling() {
    this.stopPolling();
    this.pollTimer = window.setInterval(() => {
      if (this.connectionState === 'connected') {
        // Silently poll status for dashboard metrics and player count without console spam
        this.sendCommand('status', true);
      }
    }, 5000);
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private rejectAllPending() {
    this.pendingRequests.forEach((resolve, id) => {
      resolve({
        Identifier: id,
        Message: 'Connection closed',
        Type: 'Error',
      });
    });
    this.pendingRequests.clear();
  }

  public sendCommand(command: string, silent = false): Promise<RconMessage> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('RCON is not connected'));
        return;
      }

      const id = ++this.messageCounter;
      if (silent) {
        this.silentRequests.add(id);
      }
      this.pendingRequests.set(id, resolve);

      const payload = {
        Identifier: id,
        Message: command,
        Name: 'WebRcon',
      };

      try {
        this.ws.send(JSON.stringify(payload));
      } catch (err) {
        this.silentRequests.delete(id);
        this.pendingRequests.delete(id);
        reject(err);
      }
    });
  }

  public getLogHistory(): RconMessage[] {
    return [...this.logHistory];
  }

  public clearLogHistory(): void {
    this.logHistory = [];
  }

  public addLogToHistory(msg: RconMessage): void {
    this.logHistory.push(msg);
    if (this.logHistory.length > 2000) {
      this.logHistory.shift();
    }
  }

  public getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  public clearChatHistory(): void {
    this.chatHistory = [];
  }

  public addChatToHistory(chat: ChatMessage): void {
    this.chatHistory.push(chat);
    if (this.chatHistory.length > 500) {
      this.chatHistory.shift();
    }
  }

  public async sendChatMessage(text: string): Promise<void> {
    const chatItem: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      sender: 'SERVER',
      message: text,
      timestamp: new Date().toLocaleTimeString(),
      color: '#e78978',
    };
    this.addChatToHistory(chatItem);
    this.chatListeners.forEach((l) => l(chatItem));
    try {
      await this.sendCommand(`say "${text}"`);
    } catch (e) {
      console.warn('Could not dispatch say to live server (offline):', e);
    }
  }

  public getCombatHistory(): FeedEvent[] {
    return [...this.combatHistory];
  }

  public clearCombatHistory(): void {
    this.combatHistory = [];
  }

  public addCombatToHistory(event: FeedEvent): void {
    this.combatHistory.unshift(event);
    if (this.combatHistory.length > 500) {
      this.combatHistory.pop();
    }
  }

  public onCombatEvent(listener: Listener<FeedEvent>): () => void {
    this.combatListeners.push(listener);
    return () => {
      this.combatListeners = this.combatListeners.filter((l) => l !== listener);
    };
  }

  public parseFeedEvent(rawText: string): FeedEvent | null {
    if (!rawText) return null;
    const text = rawText.trim();
    const lower = text.toLowerCase();
    const timeStr = new Date().toLocaleTimeString();

    // 1. Anti-cheat / Violations
    if (
      lower.includes('violation') ||
      lower.includes('flyhack') ||
      lower.includes('speedhack') ||
      lower.includes('eyehack') ||
      lower.includes('packet flooding')
    ) {
      return {
        id: `ac-${Date.now()}-${Math.random()}`,
        type: 'anticheat',
        timestamp: timeStr,
        raw: text,
        details: text
      };
    }
    // 2. Explosives / Raiding
    if (
      lower.includes('timed.explosive') ||
      lower.includes('ammo.rocket') ||
      lower.includes('explosive.satchel') ||
      lower.includes('mlrs') ||
      lower.includes('grenade.f1') ||
      (lower.includes('exploded') && !lower.includes('firework'))
    ) {
      return {
        id: `raid-${Date.now()}-${Math.random()}`,
        type: 'raid',
        timestamp: timeStr,
        raw: text,
        details: text
      };
    }
    // 3. PvP / Combat death
    if (
      lower.includes('was killed by') ||
      lower.includes('killed by') ||
      lower.includes('died (') ||
      lower.includes('suicide')
    ) {
      return {
        id: `kill-${Date.now()}-${Math.random()}`,
        type: 'kill',
        timestamp: timeStr,
        raw: text,
        details: text
      };
    }
    // 4. Connect / Disconnect
    if (lower.includes('joined [') || lower.includes('connected [') || lower.includes('steamauth') || lower.includes('has entered the game')) {
      return {
        id: `conn-${Date.now()}-${Math.random()}`,
        type: 'connect',
        timestamp: timeStr,
        raw: text,
        details: text
      };
    }
    if (lower.includes('disconnecting:') || lower.includes('kicked:') || lower.includes('banned:') || lower.includes('left the server')) {
      return {
        id: `disc-${Date.now()}-${Math.random()}`,
        type: lower.includes('kicked:') || lower.includes('banned:') ? 'ban' : 'disconnect',
        timestamp: timeStr,
        raw: text,
        details: text
      };
    }

    return null;
  }

  public logToConsole(message: string, type: 'Generic' | 'Log' | 'Warning' | 'Error' | 'Chat' = 'Generic') {
    const item: RconMessage = {
      Identifier: 9999,
      Message: message,
      Type: type,
      timestamp: Date.now(),
    };
    this.addLogToHistory(item);
    this.logListeners.forEach((l) => l(item));
  }

  public onPermissionsChange(listener: () => void): () => void {
    this.permissionChangeListeners.push(listener);
    return () => {
      this.permissionChangeListeners = this.permissionChangeListeners.filter((l) => l !== listener);
    };
  }

  public notifyPermissionsChange() {
    this.permissionChangeListeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('Error in permission change listener:', e);
      }
    });
  }

  private handleMessage(data: RconMessage) {
    const isSilent = this.silentRequests.has(data.Identifier);
    if (isSilent) {
      this.silentRequests.delete(data.Identifier);
    } else {
      this.addLogToHistory(data);
      // Notify log listeners only when not marked silent
      this.logListeners.forEach((l) => l(data));
    }

    // Handle responses to specific commands
    if (data.Identifier > 0 && this.pendingRequests.has(data.Identifier)) {
      const resolver = this.pendingRequests.get(data.Identifier);
      this.pendingRequests.delete(data.Identifier);
      if (resolver) resolver(data);
    }

    const msg = data.Message || '';

    // Automatically trigger permission refresh if an oxide permission message is detected
    if (
      msg.includes('granted permission') ||
      msg.includes('revoked permission') ||
      msg.includes('added to group') ||
      msg.includes('removed from group') ||
      msg.includes('Group created') ||
      msg.includes('Group removed') ||
      msg.includes('already has permission') ||
      msg.includes('does not have permission')
    ) {
      this.notifyPermissionsChange();
    }

    // Check for Status output
    if (msg.includes('hostname:') && msg.includes('version :')) {
      const parsedStatus = this.parseStatusOutput(msg);
      if (parsedStatus) {
        this.statusListeners.forEach((l) => l(parsedStatus));
      }
      const parsedPlayers = this.parsePlayersOutput(msg);
      this.playersListeners.forEach((l) => l(parsedPlayers));
    }

    // Check for Server Seed & WorldSize responses
    if (msg.includes('server.seed:')) {
      const match = msg.match(/server\.seed:\s*"(\d+)"/);
      if (match) {
        this.serverSeed = match[1];
        if (this.lastStatus) {
          this.lastStatus.seed = this.serverSeed;
          this.statusListeners.forEach((l) => l({ ...this.lastStatus! }));
        }
      }
    }
    if (msg.includes('server.worldsize:')) {
      const match = msg.match(/server\.worldsize:\s*"(\d+)"/);
      if (match) {
        this.serverWorldSize = parseInt(match[1], 10) || this.serverWorldSize;
        if (this.lastStatus) {
          this.lastStatus.worldSize = this.serverWorldSize;
          this.statusListeners.forEach((l) => l({ ...this.lastStatus! }));
        }
      }
    }

    // Check for Plugins output
    if (msg.includes('Listing') && msg.includes('plugins:')) {
      const parsedPlugins = this.parsePluginsOutput(msg);
      this.pluginsListeners.forEach((l) => l(parsedPlugins));
    }

    // Check for Chat
    if (data.Type === 'Chat' || msg.startsWith('[CHAT]') || (msg.includes('] [Chat]') && !msg.includes('RCON:'))) {
      const chatItem = this.parseChatMessage(data);
      if (chatItem) {
        this.addChatToHistory(chatItem);
        this.chatListeners.forEach((l) => l(chatItem));
      }
    }

    // Check for Combat & World Feed Events
    const feedEvent = this.parseFeedEvent(msg);
    if (feedEvent) {
      this.addCombatToHistory(feedEvent);
      this.combatListeners.forEach((l) => l(feedEvent));
    }
  }

  private parseStatusOutput(text: string): ServerStatus | null {
    try {
      const hostnameMatch = text.match(/hostname:\s*(.+)/);
      const versionMatch = text.match(/version\s*:\s*(.+)/);
      const mapMatch = text.match(/map\s*:\s*(.+)/);
      const playersMatch = text.match(/players\s*:\s*(\d+)\s*\((\d+)\s*max\)\s*\((\d+)\s*queued\)\s*\((\d+)\s*joining\)/);

      const parsed: ServerStatus = {
        hostname: hostnameMatch ? hostnameMatch[1].trim() : 'Rust Server',
        version: versionMatch ? versionMatch[1].trim() : '',
        map: mapMatch ? mapMatch[1].trim() : 'Procedural Map',
        players: playersMatch ? parseInt(playersMatch[1], 10) : 0,
        maxPlayers: playersMatch ? parseInt(playersMatch[2], 10) : 50,
        queued: playersMatch ? parseInt(playersMatch[3], 10) : 0,
        joining: playersMatch ? parseInt(playersMatch[4], 10) : 0,
        seed: this.serverSeed,
        worldSize: this.serverWorldSize,
      };
      this.lastStatus = parsed;
      return parsed;
    } catch {
      return null;
    }
  }

  private parsePlayersOutput(text: string): Player[] {
    const players: Player[] = [];
    const lines = text.split('\n');
    const headerIndex = lines.findIndex((l) => l.trim().startsWith('id ') && l.includes('name') && l.includes('ping'));
    if (headerIndex === -1) return players;

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Format: id name ping connected addr owner violation kicks entityId
      const parts = line.split(/\s+/);
      if (parts.length >= 7) {
        players.push({
          id: parts[0],
          name: parts.slice(1, parts.length - 7).join(' ') || parts[1],
          ping: parseInt(parts[parts.length - 7], 10) || 0,
          connected: parts[parts.length - 6] || '',
          addr: parts[parts.length - 5] || '',
          owner: parts[parts.length - 4] || '',
          violation: parseFloat(parts[parts.length - 3]) || 0,
          kicks: parseInt(parts[parts.length - 2], 10) || 0,
          entityId: parts[parts.length - 1] || '',
        });
      }
    }
    return players;
  }

  private parsePluginsOutput(text: string): OxidePlugin[] {
    const plugins: OxidePlugin[] = [];
    const lines = text.split('\n');
    for (const line of lines) {
      // 1. Active plugin: 01 "Stack Size Controller" (4.1.3) by Author (0.00s / 44 KB) - StackSizeController.cs
      const m = line.match(/^\s*(\d+)\s+"([^"]+)"\s*\(([^)]+)\)\s+by\s+([^(]+)\s*\(([^)]+)\)\s*-\s*(.+)/);
      if (m) {
        const filename = m[6].trim();
        const stem = filename.replace(/\.cs$/i, '');
        plugins.push({
          index: m[1],
          name: m[2].trim(),
          version: m[3].trim(),
          author: m[4].trim(),
          memory: m[5].trim(),
          filename,
          stem,
          status: 'loaded',
        });
        continue;
      }

      // 2. Unloaded plugin: 08 InstantCraft - Unloaded
      const mUnloaded = line.match(/^\s*(\d+)\s+([^-]+)\s*-\s*Unloaded/i);
      if (mUnloaded) {
        const stem = mUnloaded[2].trim();
        plugins.push({
          index: mUnloaded[1],
          name: stem,
          version: 'Unloaded',
          author: '-',
          memory: '-',
          filename: `${stem}.cs`,
          stem,
          status: 'unloaded',
        });
        continue;
      }

      // 3. Failed compilation: 08 CopyPaste - Failed to compile: Argument 1: ...
      const mErr = line.match(/^\s*(\d+)\s+([^-]+)\s*-\s*Failed to compile:\s*(.+)/i);
      if (mErr) {
        const stem = mErr[2].trim();
        plugins.push({
          index: mErr[1],
          name: stem,
          version: 'Compile Error',
          author: '-',
          memory: '-',
          filename: `${stem}.cs`,
          stem,
          status: 'error',
          error: mErr[3].trim(),
        });
      }
    }
    return plugins;
  }

  private parseChatMessage(data: RconMessage): ChatMessage | null {
    try {
      // Try to parse json format chat if available
      const parsed = JSON.parse(data.Message);
      if (parsed.Username && parsed.Message) {
        return {
          id: Math.random().toString(36).substring(7),
          sender: parsed.Username,
          message: parsed.Message,
          timestamp: new Date().toLocaleTimeString(),
          color: parsed.Color || '#10b981',
        };
      }
    } catch {
      // Plain text chat like: [CHAT] Player: hello
      const match = data.Message.match(/\[CHAT\]\s*([^:]+):\s*(.+)/i);
      if (match) {
        return {
          id: Math.random().toString(36).substring(7),
          sender: match[1].trim(),
          message: match[2].trim(),
          timestamp: new Date().toLocaleTimeString(),
        };
      }
    }
    return {
      id: Math.random().toString(36).substring(7),
      sender: 'Server',
      message: data.Message,
      timestamp: new Date().toLocaleTimeString(),
      color: '#e78978',
    };
  }

  // Listener subscriptions
  public onStateChange(listener: Listener<ConnectionState>) {
    this.stateListeners.push(listener);
    listener(this.connectionState);
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== listener);
    };
  }

  public onLog(listener: Listener<RconMessage>) {
    this.logListeners.push(listener);
    return () => {
      this.logListeners = this.logListeners.filter((l) => l !== listener);
    };
  }

  public onChat(listener: Listener<ChatMessage>) {
    this.chatListeners.push(listener);
    return () => {
      this.chatListeners = this.chatListeners.filter((l) => l !== listener);
    };
  }

  public onStatus(listener: Listener<ServerStatus>) {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  public onPlayers(listener: Listener<Player[]>) {
    this.playersListeners.push(listener);
    return () => {
      this.playersListeners = this.playersListeners.filter((l) => l !== listener);
    };
  }

  public onPlugins(listener: Listener<OxidePlugin[]>) {
    this.pluginsListeners.push(listener);
    return () => {
      this.pluginsListeners = this.pluginsListeners.filter((l) => l !== listener);
    };
  }
}

export const rconService = new RconService();
