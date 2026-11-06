/**
 * MainLayout Component
 * Main application layout with sidebar and content area
 */

import { ReactNode, useEffect, useState } from 'react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use registered screens or defaults
  const menuItems = screens.length > 0 ? screens : defaultScreens;

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <div className="flex h-dvh bg-white dark:bg-slate-900 overflow-hidden">
      {/* Sidebar: fixed on desktop, slide-over menu below lg */}
      <Sidebar
        items={menuItems}
        activeItem={currentScreen}
        onItemClick={navigateTo}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          lastUpdate={lastUpdate}
          onMenuClick={() => setIsMenuOpen(true)}
          isMenuOpen={isMenuOpen}
        />

        {/* Content - Scrollable with theme background */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
          <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8 max-w-7xl bg-white dark:bg-slate-900">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
