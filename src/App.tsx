import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { ConsoleTab } from './components/ConsoleTab';
import { MapTab } from './components/MapTab';
import { ItemsTab } from './components/ItemsTab';
import { PlayersTab } from './components/PlayersTab';
import { PluginsTab } from './components/PluginsTab';
import { ChatTab } from './components/ChatTab';
import { ConnectModal } from './components/ConnectModal';
import { rconService } from './services/rconService';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  useEffect(() => {
    // Attempt auto-connect with saved settings or defaults
    const host = localStorage.getItem('rustadmin_host') || '127.0.0.1';
    const port = parseInt(localStorage.getItem('rustadmin_port') || '28016', 10);
    const pass = localStorage.getItem('rustadmin_pass') || 'rcon.password';

    rconService.connect(host, port, pass);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConnect={() => setIsConnectOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'console' && <ConsoleTab />}
        {activeTab === 'map' && <MapTab />}
        {activeTab === 'items' && <ItemsTab />}
        {activeTab === 'players' && <PlayersTab />}
        {activeTab === 'plugins' && <PluginsTab />}
        {activeTab === 'chat' && <ChatTab />}
      </main>

      <ConnectModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
      />
    </div>
  );
}

export default App;
