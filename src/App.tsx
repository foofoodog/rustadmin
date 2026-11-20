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

      <main className="flex-1 max-w-7xl 2xl:max-w-[1536px] w-full mx-auto p-3 sm:p-5 lg:p-6">
        {/* Server Section */}
        <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}><DashboardTab /></div>
        <div className={activeTab === 'convars' ? 'block' : 'hidden'}><ConvarsTab /></div>
        <div className={activeTab === 'automation' ? 'block' : 'hidden'}><AutomationTab /></div>

        {/* Monitoring Section */}
        <div className={activeTab === 'console' ? 'block' : 'hidden'}><ConsoleTab /></div>
        <div className={activeTab === 'map' ? 'block' : 'hidden'}><MapTab /></div>
        <div className={activeTab === 'combat' ? 'block' : 'hidden'}><CombatFeedTab /></div>
        <div className={activeTab === 'chat' ? 'block' : 'hidden'}><ChatTab /></div>

        {/* Players & Plugins Section */}
        <div className={(activeTab === 'players-list' || activeTab === 'players') ? 'block' : 'hidden'}><PlayersTab /></div>
        <div className={activeTab === 'plugins' ? 'block' : 'hidden'}><PluginsTab /></div>

        {/* Arsenal & Spawner Section */}
        <div className={activeTab === 'items' ? 'block' : 'hidden'}><ItemsTab /></div>
        <div className={activeTab === 'kits' ? 'block' : 'hidden'}><KitsTab /></div>
        <div className={activeTab === 'prefabs' ? 'block' : 'hidden'}><PrefabSpawnerTab /></div>
      </main>

      <ConnectModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
      />
    </div>
  );
}

export default App;
