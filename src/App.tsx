/**
 * App Component
 * Main application entry with provider hierarchy and layout
 */

import { NavigationProvider } from './contexts/NavigationContext';
import { DataProvider } from './contexts/DataContext';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardScreen } from './screens/DashboardScreen';
import { SifjScreen } from './screens/SifjScreen';
import { SeScreen } from './screens/SeScreen';
import { GicScreen } from './screens/GicScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useData } from './hooks/useData';
import { useNavigation } from './hooks/useNavigation';

// Inner component that uses DataContext
const AppContent = () => {
  const { lastUpdate } = useData();
  const { currentScreen } = useNavigation();

  return (
    <MainLayout lastUpdate={lastUpdate}>
      {currentScreen === 'sifj' ? (
        <SifjScreen />
      ) : currentScreen === 'se' ? (
        <SeScreen />
      ) : currentScreen === 'gic' ? (
        <GicScreen />
      ) : (
        <DashboardScreen />
      )}
    </MainLayout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <NavigationProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </NavigationProvider>
    </ErrorBoundary>
  );
}

export default App;
