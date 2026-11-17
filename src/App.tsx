import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { ConsoleTab } from './components/ConsoleTab';
import { MapTab } from './components/MapTab';
import { ItemsTab } from './components/ItemsTab';
import { PlayersTab } from './components/PlayersTab';
import { PluginsTab } from './components/PluginsTab';
import { ChatTab } from './components/ChatTab';
import { KitsTab } from './components/KitsTab';
import { CombatFeedTab } from './components/CombatFeedTab';
import { ConvarsTab } from './components/ConvarsTab';
import { AutomationTab } from './components/AutomationTab';
import { PrefabSpawnerTab } from './components/PrefabSpawnerTab';
import { ConnectModal } from './components/ConnectModal';
import { rconService } from './services/rconService';
import { getActiveProfile } from './services/serverProfiles';

export function App() {
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '').trim();
    return hash || 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(getTabFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleTabChange = (tab: string) => {
    if (window.location.hash.replace('#', '') !== tab) {
      window.location.hash = tab;
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    // Attempt auto-connect with saved active profile or defaults
    const profile = getActiveProfile();
    const host = localStorage.getItem('rustadmin_host') || profile.host;
    const port = parseInt(localStorage.getItem('rustadmin_port') || profile.port.toString(), 10);
    const pass = localStorage.getItem('rustadmin_pass') || profile.password;

    rconService.connect(host, port, pass);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100">
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenConnect={() => setIsConnectOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Server Section */}
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'convars' && <ConvarsTab />}
        {activeTab === 'automation' && <AutomationTab />}

        {/* Monitoring Section */}
        {activeTab === 'console' && <ConsoleTab />}
        {activeTab === 'map' && <MapTab />}
        {activeTab === 'combat' && <CombatFeedTab />}
        {activeTab === 'chat' && <ChatTab />}

        {/* Players & Plugins Section */}
        {(activeTab === 'players-list' || activeTab === 'players') && <PlayersTab />}
        {activeTab === 'plugins' && <PluginsTab />}

        {/* Arsenal & Spawner Section */}
        {activeTab === 'items' && <ItemsTab />}
        {activeTab === 'kits' && <KitsTab />}
        {activeTab === 'prefabs' && <PrefabSpawnerTab />}
      </main>

      <ConnectModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
      />
    </div>
  );
}

export default App;
