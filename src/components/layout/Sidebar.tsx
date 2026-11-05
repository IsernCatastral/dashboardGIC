/**
 * Sidebar Component
 * Navigation sidebar with menu items
 */

import type { Screen } from '../../types';

interface SidebarProps {
  items: Screen[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

export const Sidebar = ({ items, activeItem, onItemClick }: SidebarProps) => {
  return (
    <aside className="w-64 bg-blue-900 dark:bg-gray-800 min-h-screen border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="flex-1 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Dashboard</h2>
        
        <nav className="space-y-2">
          {items.map((item) => {
            const isActive = item.id === activeItem;
            
            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
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
