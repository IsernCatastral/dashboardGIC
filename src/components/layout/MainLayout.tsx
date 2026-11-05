/**
 * MainLayout Component
 * Main application layout with sidebar and content area
 */

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useNavigation } from '../../hooks/useNavigation';
import type { Screen } from '../../types';

interface MainLayoutProps {
  children: ReactNode;
  lastUpdate: Date | null;
}

// Default navigation items
const defaultScreens: Screen[] = [
  { id: 'dashboard', label: 'GENERAL', icon: '📊' },
  { id: 'sifj', label: 'SIFJ', icon: '📁' },
  { id: 'se', label: 'SE', icon: '📁' },
  { id: 'gic', label: 'GIC', icon: '📁' },
];

export const MainLayout = ({ children, lastUpdate }: MainLayoutProps) => {
  const { currentScreen, navigateTo, screens } = useNavigation();

  // Use registered screens or defaults
  const menuItems = screens.length > 0 ? screens : defaultScreens;

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        items={menuItems}
        activeItem={currentScreen}
        onItemClick={navigateTo}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header lastUpdate={lastUpdate} />

        {/* Content - Scrollable with theme background */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
          <div className="container mx-auto px-6 py-8 max-w-7xl bg-white dark:bg-slate-900">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
