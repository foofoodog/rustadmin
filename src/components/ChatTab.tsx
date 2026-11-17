import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Trash2, ArrowDown } from 'lucide-react';
import { rconService } from '../services/rconService';
import { ChatMessage } from '../types/rcon';

export const ChatTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = rconService.onChat((chat) => {
      setMessages((prev) => [...prev.slice(-300), chat]);
    });
    return () => unsub();
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

    // Locally echo server message
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        sender: 'SERVER',
        message: text,
        timestamp: new Date().toLocaleTimeString(),
        color: '#e78978',
      },
    ]);

    setInputMsg('');
    await rconService.sendCommand(`say "${text}"`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
      {/* Chat Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/90">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-rust-500" />
          <span className="text-sm font-bold text-zinc-100">Live Server Chat</span>
          <span className="text-xs text-zinc-500">({messages.length} messages)</span>
        </div>

        <div className="flex items-center space-x-2">
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
            onClick={() => setMessages([])}
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
    </div>
  );
};
