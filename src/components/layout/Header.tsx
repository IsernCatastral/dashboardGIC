/**
 * Header Component
 * Displays app title and theme toggle
 */

import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  lastUpdate: Date | null;
}

export const Header = ({ lastUpdate: _lastUpdate }: HeaderProps) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard Entidad</h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
