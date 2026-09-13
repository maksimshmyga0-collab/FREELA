import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Topbar } from './components/layout/Topbar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { ItemModal } from './components/common/ItemModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { CaseStudyModal } from './components/modals/CaseStudyModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { WidgetSettingsModal } from './components/dashboard/WidgetSettingsModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { BrandLogo } from './components/common/BrandLogo';

import { DashboardPage } from './pages/DashboardPage';
import { WorkPage } from './pages/WorkPage';
import { FinancePage } from './pages/FinancePage';
import { CreatorPage } from './pages/CreatorPage';
import { BoardsPage } from './pages/BoardsPage';

const MainLayout: React.FC = () => {
  const { mainSection, activeBoardId } = useApp();
  const isCanvasActive = mainSection === 'boards' && Boolean(activeBoardId);

  const renderActivePage = () => {
    switch (mainSection) {
      case 'dashboard':
        return <DashboardPage />;
      case 'work':
        return <WorkPage />;
      case 'boards':
        return <BoardsPage />;
      case 'finance':
        return <FinancePage />;
      case 'creator':
        return <CreatorPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0A0C10] text-slate-200">
      {/* Topbar: CLARYFE | Главная | Работа | Создание | Доски | Финансы + Controls */}
      <Topbar />

      {/* Mobile Drawer */}
      <MobileDrawer />

      {/* Scrollable Page Content / Full Canvas */}
      <main
        id="main-content-scroll"
        className={
          isCanvasActive
            ? 'flex-1 overflow-hidden relative'
            : 'flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-7 dark-scrollbar'
        }
      >
        <div className={isCanvasActive ? 'h-full w-full' : 'max-w-6xl mx-auto'}>
          {renderActivePage()}
        </div>
      </main>

      {/* Auxiliary Modals */}
      <GlobalSearchModal />
      <CaseStudyModal />
      <SettingsModal />
      <ProfileModal />
      <WidgetSettingsModal />
      <ItemModal />
    </div>
  );
};

const RootRouter: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[#0A0C10] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <BrandLogo size="md" showText={false} className="animate-pulse" />
          <span className="text-xs font-medium tracking-wide text-slate-400">
            Загрузка CLARYFE...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RootRouter />
    </AuthProvider>
  );
}
