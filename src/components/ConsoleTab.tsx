import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Send, 
  Trash2, 
  ArrowDown, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { RconMessage } from '../types/rcon';
import { CONSOLE_COMMANDS, CommandInfo } from '../data/consoleCommands';

export const ConsoleTab: React.FC = () => {
  const [logs, setLogs] = useState<RconMessage[]>([]);
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<CommandInfo[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = rconService.onLog((msg) => {
      setLogs((prev) => [...prev.slice(-1000), msg]);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Automatically scroll the suggestions list to keep selected suggestion in view
  useEffect(() => {
    if (showSuggestions && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [selectedSuggestionIndex, showSuggestions]);

  // Update suggestions when command input changes
  useEffect(() => {
    const trimmed = command.trim();
    if (!trimmed) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Only autocomplete the first word (the command itself)
    const firstWord = command.split(' ')[0].toLowerCase();
    if (firstWord.length >= 1) {
      // Prioritize exact prefix matches, then substring matches
      const prefixMatches: CommandInfo[] = [];
      const subMatches: CommandInfo[] = [];

      for (const c of CONSOLE_COMMANDS) {
        const cmdLower = c.command.toLowerCase();
        if (cmdLower.startsWith(firstWord)) {
          prefixMatches.push(c);
        } else if (cmdLower.includes(firstWord)) {
          subMatches.push(c);
        }
        if (prefixMatches.length + subMatches.length >= 60) break;
      }

      const matches = [...prefixMatches, ...subMatches].slice(0, 40);

      setSuggestions(matches);
      setSelectedSuggestionIndex(0);
      setShowSuggestions(matches.length > 0 && !command.includes(' '));
    } else {
      setShowSuggestions(false);
    }
  }, [command]);

  const handleSendCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = command.trim();
    if (!cmd) return;

    setShowSuggestions(false);
    setCommandHistory((prev) => [cmd, ...prev.slice(0, 50)]);
    setHistoryIndex(-1);
    setCommand('');

    // Echo locally in console
    setLogs((prev) => [
      ...prev,
      {
        Identifier: 9999,
        Message: `> ${cmd}`,
        Type: 'Generic',
        timestamp: Date.now(),
      },
    ]);

    try {
      await rconService.sendCommand(cmd);
      // Trigger sync for Permissions Tab if a permission or group command was run
      const lower = cmd.toLowerCase();
      if (
        lower.startsWith('oxide.grant') ||
        lower.startsWith('oxide.revoke') ||
        lower.startsWith('oxide.group') ||
        lower.startsWith('oxide.usergroup') ||
        lower.startsWith('o.grant') ||
        lower.startsWith('o.revoke') ||
        lower.startsWith('grant ') ||
        lower.startsWith('revoke ')
      ) {
        setTimeout(() => {
          rconService.notifyPermissionsChange();
        }, 300);
      }
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        {
          Identifier: 9999,
          Message: `Error executing command: ${err.message}`,
          Type: 'Error',
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const applySuggestion = (sug: CommandInfo) => {
    setCommand(sug.command + ' ');
    setShowSuggestions(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If autocomplete is visible
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIndex]);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    // Normal Command History navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex + 1 < commandHistory.length) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex - 1 >= 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      } else if (historyIndex - 1 === -1) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'all') {
      if (filterType === 'chat' && log.Type !== 'Chat') return false;
      if (filterType === 'warning' && log.Type !== 'Warning') return false;
      if (filterType === 'error' && log.Type !== 'Error') return false;
      if (filterType === 'log' && log.Type !== 'Log') return false;
    }
    if (searchQuery) {
      return log.Message.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getLogColor = (type?: string, msg?: string) => {
    if (type === 'Error' || (msg && msg.toLowerCase().includes('failed to compile'))) return 'text-rose-400';
    if (type === 'Warning' || (msg && msg.toLowerCase().includes('warning'))) return 'text-amber-400';
    if (type === 'Chat') return 'text-emerald-400';
    if (msg && msg.startsWith('>')) return 'text-rust-400 font-semibold';
    return 'text-zinc-300';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg relative">
      {/* Console Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/90 gap-2">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4 text-rust-500" />
          <span className="text-sm font-bold text-zinc-100">Live Console</span>
          <span className="text-xs text-zinc-500">({logs.length} messages)</span>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter logs..."
              className="pl-8 pr-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-36 sm:w-48 transition-colors"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg text-xs py-1 px-2.5 focus:outline-none focus:border-rust-500"
          >
            <option value="all">All Types</option>
            <option value="chat">Chat Only</option>
            <option value="warning">Warnings</option>
            <option value="error">Errors</option>
          </select>

          {/* Auto Scroll Toggle */}
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

          {/* Clear Logs */}
          <button
            onClick={() => setLogs([])}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        ref={logContainerRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 bg-zinc-950 selection:bg-rust-900"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm italic">
            No console output yet. Send a command below.
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="flex space-x-2 leading-relaxed break-all">
              <span className="text-zinc-600 select-none text-[10px] pt-0.5">
                {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
              </span>
              <pre className={`whitespace-pre-wrap font-mono flex-1 ${getLogColor(log.Type, log.Message)}`}>
                {log.Message}
              </pre>
            </div>
          ))
        )}
      </div>

      {/* Autocomplete Popup (In-Game Style) */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-[58px] left-3 right-3 sm:right-auto sm:w-[520px] bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3 py-1.5 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center space-x-1.5 font-semibold text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-rust-500" />
              <span>Console Suggestions</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                ({selectedSuggestionIndex + 1}/{suggestions.length})
              </span>
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 rounded border border-zinc-700 text-[10px] font-mono">Tab</kbd> complete • <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 rounded border border-zinc-700 text-[10px] font-mono">↑↓</kbd> navigate
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800/40">
            {suggestions.map((sug, idx) => {
              const isSelected = idx === selectedSuggestionIndex;
              return (
                <div
                  key={sug.command}
                  ref={isSelected ? selectedItemRef : null}
                  onClick={() => applySuggestion(sug)}
                  onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                  className={`px-3 py-2 cursor-pointer transition-colors flex items-center justify-between text-xs ${
                    isSelected ? 'bg-rust-950/70 border-l-2 border-rust-500 text-white' : 'hover:bg-zinc-800/50 text-zinc-300'
                  }`}
                >
                  <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono font-bold ${isSelected ? 'text-white' : 'text-zinc-100'}`}>
                        {sug.command}
                      </span>
                      <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-400 text-[10px] rounded font-semibold uppercase">
                        {sug.category}
                      </span>
                    </div>
                    {sug.syntax && (
                      <div className="font-mono text-[11px] text-rust-400 truncate">
                        {sug.syntax}
                      </div>
                    )}
                    <div className="text-[11px] text-zinc-400 truncate">{sug.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Command Pills */}
      <div className="flex items-center space-x-2 px-4 py-2 border-t border-zinc-800/80 bg-zinc-900/50 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0">
          Quick:
        </span>
        {['status', 'plugins', 'serverinfo', 'playerlistpos', 'server.save', 'oxide.version'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => {
              setCommand(cmd);
              rconService.sendCommand(cmd);
            }}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-mono text-[11px] shrink-0 transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Command Input Box */}
      <form onSubmit={handleSendCommand} className="p-3 border-t border-zinc-800 bg-zinc-900 flex space-x-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-2.5 font-mono text-rust-500 text-sm font-bold select-none">
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type console command (Tab to autocomplete)..."
            className="w-full pl-8 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 font-mono focus:outline-none focus:border-rust-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-rust-600 hover:bg-rust-500 text-white rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span>Execute</span>
        </button>
      </form>
    </div>
  );
};
