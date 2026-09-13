import React from 'react';
import {
  X,
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Users,
  CheckSquare,
  Wallet,
  Sparkles,
  Lightbulb,
  FileText,
  TrendingUp,
  User,
  Plus,
  LayoutGrid,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MainNavSection, WorkSubTab, CreatorSubTab } from '../../types';

export const MobileDrawer: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    mainSection,
    setMainSection,
    workTab,
    setWorkTab,
    creatorTab,
    setCreatorTab,
    openProfile,
    openCreateModal,
    kpi,
    boards,
  } = useApp();

  if (!isMobileMenuOpen) return null;

  const handleNav = (section: MainNavSection, sub?: WorkSubTab | CreatorSubTab) => {
    setMainSection(section);
    if (section === 'work' && sub) setWorkTab(sub as WorkSubTab);
    if (section === 'creator' && sub) setCreatorTab(sub as CreatorSubTab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div className="relative w-[300px] max-w-[85vw] h-full bg-[#0D0F14] border-r border-white/[0.08] z-10 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <BrandLogo size="sm" />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-400 hover:text-white p-2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10"
            aria-label="Закрыть меню"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto dark-scrollbar p-3 space-y-4">
          {/* Section 1: Главная */}
          <div>
            <button
              onClick={() => handleNav('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                mainSection === 'dashboard'
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <LayoutDashboard size={16} className="text-emerald-400" />
              <span>Главная</span>
            </button>
          </div>

          {/* Section 2: Работа (Проекты, Клиенты, Задачи) */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Работа
            </div>
            <button
              onClick={() => handleNav('work', 'projects')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                mainSection === 'work' && workTab === 'projects'
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FolderKanban size={15} className="text-blue-400" />
                Проекты
              </span>
              <span className="text-[10px] bg-white/[0.04] px-2 py-0.5 rounded-full text-slate-400">
                {kpi.activeProjects}
              </span>
            </button>
            <button
              onClick={() => handleNav('work', 'clients')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                mainSection === 'work' && workTab === 'clients'
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users size={15} className="text-emerald-400" />
                Клиенты
              </span>
            </button>
            <button
              onClick={() => handleNav('work', 'tasks')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                mainSection === 'work' && workTab === 'tasks'
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <CheckSquare size={15} className="text-purple-400" />
                Задачи
              </span>
              <span className="text-[10px] bg-white/[0.04] px-2 py-0.5 rounded-full text-slate-400">
                {kpi.pendingTasks}
              </span>
            </button>
          </div>

          {/* Section 3: Создание (Идеи, Контент, Результаты) */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Создание
            </div>
            <button
              onClick={() => handleNav('creator', 'ideas')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                mainSection === 'creator' && creatorTab === 'ideas'
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <Lightbulb size={15} className="text-amber-400" />
              <span>Идеи</span>
            </button>
            <button
              onClick={() => handleNav('creator', 'content')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                mainSection === 'creator' && creatorTab === 'content'
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <FileText size={15} className="text-indigo-400" />
              <span>Контент</span>
            </button>
            <button
              onClick={() => handleNav('creator', 'results')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                mainSection === 'creator' && creatorTab === 'results'
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <TrendingUp size={15} className="text-emerald-400" />
              <span>Результаты</span>
            </button>
          </div>

          {/* Section: Доски */}
          <div>
            <button
              onClick={() => handleNav('boards')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                mainSection === 'boards'
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <LayoutGrid size={15} className="text-indigo-400" />
                <span>Доски</span>
              </span>
              {boards.length > 0 && (
                <span className="text-[10px] bg-white/[0.06] px-2 py-0.5 rounded-full text-slate-300">
                  {boards.length}
                </span>
              )}
            </button>
          </div>

          {/* Section 4: Финансы */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Финансы
            </div>
            <button
              onClick={() => handleNav('finance')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                mainSection === 'finance'
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <Wallet size={16} className="text-amber-400" />
              <span>Финансы и аналитика</span>
            </button>
          </div>
        </div>

        {/* Footer: Profile */}
        <div className="p-3 border-t border-white/[0.06] bg-white/[0.01]">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openProfile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <User size={15} className="text-slate-400" />
            <span>Профиль {currentUser?.displayName ? `(${currentUser.displayName})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
