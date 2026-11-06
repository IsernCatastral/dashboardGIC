/**
 * Sidebar Component
 * Navigation sidebar with menu items. Fixed on desktop (lg and up); below lg it is a
 * slide-over panel opened from the header's menu button.
 */

import type { Screen } from '../../types';

interface SidebarProps {
  items: Screen[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ items, activeItem, onItemClick, isOpen = false, onClose }: SidebarProps) => {
  return (
    <aside
      id="sidebar-menu"
      aria-label="Menú de navegación"
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-blue-900 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:visible lg:shrink-0 lg:min-h-screen ${
        isOpen ? 'translate-x-0' : '-translate-x-full invisible'
      }`}
    >
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Dashboard</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="lg:hidden p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const isActive = item.id === activeItem;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onItemClick(item.id);
                  onClose?.();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon && (
                  <span className="text-xl">{item.icon}</span>
                )}
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="p-6 border-t border-white/10">
        <p className="text-xs text-white/50 text-center">
          Dashboard Entidad v1.0
        </p>
      </div>
    </aside>
  );
};
