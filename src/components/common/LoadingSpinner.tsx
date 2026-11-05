/**
 * LoadingSpinner Component
 * Visual loading indicator with accessibility support
 */

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-4">
        <div
          role="status"
          className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"
          aria-label="Cargando datos"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    </div>
  );
};
