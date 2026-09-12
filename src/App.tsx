import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Topbar } from './components/layout/Topbar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { ItemModal } from './components/common/ItemModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { CaseStudyModal } from './components/modals/CaseStudyModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ProfileModal } from './components/modals/ProfileModal';

import { DashboardPage } from './pages/DashboardPage';
import { WorkPage } from './pages/WorkPage';
import { FinancePage } from './pages/FinancePage';
import { CreatorPage } from './pages/CreatorPage';

const MainLayout: React.FC = () => {
  const { mainSection } = useApp();

  const renderActivePage = () => {
    switch (mainSection) {
      case 'dashboard':
        return <DashboardPage />;
      case 'work':
        return <WorkPage />;
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
      {/* Topbar: FREELA | Главная | Работа | Финансы | Создавай + Controls */}
      <Topbar />

      {/* Mobile Drawer */}
      <MobileDrawer />

      {/* Scrollable Page Content */}
      <main
        id="main-content-scroll"
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-7 dark-scrollbar"
      >
        <div className="max-w-6xl mx-auto">
          {renderActivePage()}
        </div>
      </main>

      {/* Auxiliary Modals */}
      <GlobalSearchModal />
      <CaseStudyModal />
      <SettingsModal />
      <ProfileModal />
      <ItemModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
