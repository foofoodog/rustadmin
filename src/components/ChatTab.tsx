import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Trash2, ArrowDown, Sparkles, X, Check, Clock, Radio, Info } from 'lucide-react';
import { rconService } from '../services/rconService';
import { motdService, MotdConfig } from '../services/motdService';
import { ChatMessage } from '../types/rcon';

export const ChatTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => rconService.getChatHistory());
  const [inputMsg, setInputMsg] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isMotdOpen, setIsMotdOpen] = useState(false);
  const [motdConfig, setMotdConfig] = useState<MotdConfig>(() => motdService.getConfig());
  const [draftMessage, setDraftMessage] = useState(motdConfig.message);
  const [draftDelay, setDraftDelay] = useState(motdConfig.delaySeconds);
  const [draftEnabled, setDraftEnabled] = useState(motdConfig.enabled);
  const [testSent, setTestSent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubChat = rconService.onChat((chat) => {
      setMessages((prev) => [...prev.slice(-500), chat]);
    });
    const unsubMotd = motdService.onConfigChange((cfg) => {
      setMotdConfig(cfg);
    });
    return () => {
      unsubChat();
      unsubMotd();
    };
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMsg.trim();
    if (!text) return;
    setInputMsg('');
    await rconService.sendChatMessage(text);
  };

  const handleSaveMotd = (e: React.FormEvent) => {
    e.preventDefault();
    motdService.saveConfig({
      enabled: draftEnabled,
      message: draftMessage,
      delaySeconds: draftDelay
    });
    setIsMotdOpen(false);
  };

  const handleTestMotd = async () => {
    await motdService.sendManualMotd('TestPlayer');
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMotdOpen) {
        setIsMotdOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMotdOpen]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg relative">
      {/* Chat Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/90">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-rust-500" />
          <span className="text-sm font-bold text-zinc-100">Live Server Chat</span>
          <span className="text-xs text-zinc-500">({messages.length} messages)</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Welcome MOTD Settings Button */}
          <button
            onClick={() => {
              setDraftEnabled(motdConfig.enabled);
              setDraftMessage(motdConfig.message);
              setDraftDelay(motdConfig.delaySeconds);
              setIsMotdOpen(true);
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs flex items-center space-x-1.5 font-medium transition-colors ${
              motdConfig.enabled
                ? 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/50'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Configure Player Connect Welcome MOTD"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Connect MOTD</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                motdConfig.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
              }`}
            />
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 transition-colors ${
              autoScroll
                ? 'bg-rust-950/40 border-rust-800/60 text-rust-400'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Auto-scroll"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              rconService.clearChatHistory();
              setMessages([]);
            }}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-rose-400 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-950 text-sm"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm italic">
            No chat messages recorded yet.
          </div>
        ) : (
          messages.map((m) => {
            const isServer = m.sender.toUpperCase() === 'SERVER';
            return (
              <div
                key={m.id}
                className={`p-3 rounded-lg border flex flex-col space-y-1 ${
                  isServer
                    ? 'bg-rust-950/30 border-rust-900/50'
                    : 'bg-zinc-900/80 border-zinc-800/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-bold flex items-center space-x-1.5 ${
                      isServer ? 'text-rust-400' : 'text-emerald-400'
                    }`}
                  >
                    <span>{m.sender}</span>
                    {isServer && (
                      <span className="text-[10px] px-1 py-0.2 bg-rust-900/80 text-rust-200 rounded uppercase font-semibold">
                        Admin
                      </span>
                    )}
                  </span>
                  <span className="text-zinc-500 text-[11px] font-mono">{m.timestamp}</span>
                </div>
                <p className="text-zinc-200 break-words text-sm">{m.message}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Chat Send Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 bg-zinc-900 flex space-x-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Send a global server announcement message..."
          className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-rust-500 transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-rust-600 hover:bg-rust-500 text-white rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span>Say</span>
        </button>
      </form>

      {/* Player Connect MOTD Modal */}
      {isMotdOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMotdOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800/80 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Player Connect Welcome Message (MOTD)</h3>
                  <p className="text-xs text-zinc-400">Automatically welcomes players to chat when they connect</p>
                </div>
              </div>
              <button
                onClick={() => setIsMotdOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveMotd} className="p-5 space-y-4">
              {/* Enabled Switch */}
              <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <div className="flex items-center space-x-2.5">
                  <Radio className={`w-4 h-4 ${draftEnabled ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <div>
                    <span className="text-xs font-bold text-zinc-200 block">Automatic Connect MOTD</span>
                    <span className="text-[11px] text-zinc-400 block">
                      Send welcome message automatically when player finishes connecting
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDraftEnabled(!draftEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    draftEnabled ? 'bg-rust-600 justify-end' : 'bg-zinc-800 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                </button>
              </div>

              {/* Message Template Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Welcome Message Template:
                </label>
                <textarea
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  rows={3}
                  placeholder="Welcome {player} to the server! Type /help or join our Discord..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 focus:outline-none focus:border-rust-500 leading-relaxed font-sans"
                  required
                />
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center space-x-1">
                    <Info className="w-3 h-3 text-rust-400" />
                    <span>Use <code className="text-rust-300 font-mono">&#123;player&#125;</code> to insert player's name</span>
                  </span>
                  <span>{draftMessage.length} chars</span>
                </div>
              </div>

              {/* Delay Slider */}
              <div className="space-y-1.5 bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Send Delay After Connect:</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-rust-400">
                    {draftDelay} seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={draftDelay}
                  onChange={(e) => setDraftDelay(parseInt(e.target.value, 10))}
                  className="w-full accent-rust-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 block">
                  Allows player to finish spawning into the world so they don't miss the chat message.
                </span>
              </div>

              {/* Live Preview */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  In-Game Chat Preview:
                </span>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs">
                    <span className="font-bold text-rust-400">SERVER</span>
                    <span className="text-[9px] px-1 py-0.2 bg-rust-900/80 text-rust-200 rounded uppercase font-semibold">
                      Admin
                    </span>
                    <span className="text-zinc-600 text-[10px]">Just now</span>
                  </div>
                  <p className="text-xs text-zinc-200 break-words leading-relaxed">
                    {motdService.formatMessage('RustPlayer', draftMessage)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestMotd}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center space-x-1.5 ${
                    testSent
                      ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                      : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                  }`}
                >
                  {testSent ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Test Sent to Chat!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Test Send Now</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsMotdOpen(false)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rust-600 hover:bg-rust-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save MOTD</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

