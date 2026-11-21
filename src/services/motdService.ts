import { rconService } from './rconService';
import { FeedEvent } from '../types/rcon';

export interface MotdConfig {
  enabled: boolean;
  message: string;
  delaySeconds: number;
}

const STORAGE_KEY = 'rustadmin_motd_config';

const DEFAULT_MOTD: MotdConfig = {
  enabled: true,
  message: 'Welcome {player} to the server! Type /help or join our Discord for rules. Have fun!',
  delaySeconds: 5
};

class MotdService {
  private config: MotdConfig = DEFAULT_MOTD;
  private listeners: Set<(config: MotdConfig) => void> = new Set();
  private recentConnects = new Set<string>();

  constructor() {
    this.loadConfig();
    this.initListener();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.config = { ...DEFAULT_MOTD, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load MOTD config', e);
    }
  }

  public getConfig(): MotdConfig {
    return { ...this.config };
  }

  public saveConfig(newConfig: Partial<MotdConfig>) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save MOTD config', e);
    }
    this.listeners.forEach((fn) => fn(this.config));
  }

  public onConfigChange(listener: (config: MotdConfig) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private initListener() {
    rconService.onCombatEvent((event: FeedEvent) => {
      if (!this.config.enabled || event.type !== 'connect') return;

      const playerName = this.extractPlayerName(event.raw);
      if (!playerName) return;

      // Deduplicate rapid connect events for the same player within 30 seconds
      if (this.recentConnects.has(playerName.toLowerCase())) return;
      this.recentConnects.add(playerName.toLowerCase());
      setTimeout(() => {
        this.recentConnects.delete(playerName.toLowerCase());
      }, 30000);

      this.scheduleMotd(playerName);
    });
  }

  public extractPlayerName(rawText: string): string {
    // 1. IP:PORT/STEAMID/PlayerName joined [windows/steam]
    const mJoined = rawText.match(/\/\d+\/([^/]+)\s+joined\s+\[/i);
    if (mJoined) return mJoined[1].trim();

    // 2. PlayerName[12345/7656119...] has entered the game
    const mEntered = rawText.match(/^([^\[]+)\[\d+\/\d+\]\s+has\s+entered/i);
    if (mEntered) return mEntered[1].trim();

    // 3. [Player Connected] PlayerName (7656119...)
    const mConnected = rawText.match(/connected\]?\s*([^(]+)\s*\(/i);
    if (mConnected) return mConnected[1].trim();

    // 4. SteamAuth: PlayerName
    const mSteam = rawText.match(/steamauth:\s*(.+)/i);
    if (mSteam) return mSteam[1].trim();

    return 'Survivor';
  }

  public formatMessage(playerName: string, template?: string): string {
    const text = template !== undefined ? template : this.config.message;
    return text.replace(/{player}/gi, playerName);
  }

  public async sendManualMotd(playerName: string = 'Survivor') {
    const text = this.formatMessage(playerName);
    await rconService.sendChatMessage(text);
  }

  private scheduleMotd(playerName: string) {
    const delayMs = Math.max(0, this.config.delaySeconds) * 1000;
    setTimeout(async () => {
      if (!this.config.enabled) return;
      const text = this.formatMessage(playerName);
      await rconService.sendChatMessage(text);
    }, delayMs);
  }
}

export const motdService = new MotdService();
