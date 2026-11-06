/**
 * Header Component
 * Displays app title; below lg it also shows the menu (hamburger) button
 */

interface HeaderProps {
  lastUpdate: Date | null;
  onMenuClick?: () => void;
  isMenuOpen?: boolean;
}

export const Header = ({ lastUpdate: _lastUpdate, onMenuClick, isMenuOpen = false }: HeaderProps) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 px-3 py-3 sm:px-6 sm:py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
            aria-controls="sidebar-menu"
            className="lg:hidden p-2 -ml-1 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-primary truncate">Dashboard Entidad</h1>
        </div>
      </div>
    </header>
  );
};
