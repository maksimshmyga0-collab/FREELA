import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  Wallet,
  Lightbulb,
  FileText,
  TrendingUp,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavSection } from '../../types';

interface SidebarProps {
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile = false }) => {
  const {
    activeSection,
    setActiveSection,
    setIsMobileMenuOpen,
    projects,
    tasks,
    ideas,
    resetDemoData,
  } = useApp();

  const handleNav = (section: NavSection) => {
    setActiveSection(section);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const activeProjectsCount = projects.filter((p) => p.status === 'В работе').length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;
  const newIdeasCount = ideas.filter((i) => i.status === 'Новая').length;

  const mainNav = [
    { id: 'dashboard' as NavSection, label: 'Главная', icon: LayoutDashboard },
    { id: 'projects' as NavSection, label: 'Проекты', icon: FolderKanban, badge: activeProjectsCount },
    { id: 'clients' as NavSection, label: 'Клиенты', icon: Users },
    { id: 'tasks' as NavSection, label: 'Задачи', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'finance' as NavSection, label: 'Финансы', icon: Wallet },
  ];

  const creatorNav = [
    { id: 'ideas' as NavSection, label: 'Идеи', icon: Lightbulb, badge: newIdeasCount },
    { id: 'content' as NavSection, label: 'Контент', icon: FileText },
    { id: 'results' as NavSection, label: 'Результаты', icon: TrendingUp },
  ];

  return (
    <aside
      id="freela-sidebar"
      className={`flex flex-col h-full bg-[#0D0F14] text-slate-200 border-r border-white/[0.06] select-none ${
        isMobile ? 'w-full' : 'w-[240px] min-w-[240px]'
      }`}
    >
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-slate-950 flex items-center justify-center font-black tracking-tight text-sm shadow-xs">
            F
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              FREELA
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">Workspace</p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 dark-scrollbar">
        {/* Main Section */}
        <nav className="space-y-0.5">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 min-h-[40px] ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={16}
                    className={`transition-colors ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-white/[0.04] text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Subtle Divider */}
        <div className="pt-2 pb-1">
          <div className="h-px bg-white/[0.06] w-full" />
        </div>

        {/* Creator Section */}
        <nav className="space-y-0.5">
          {creatorNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-creator-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 min-h-[40px] ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={16}
                    className={`transition-colors ${
                      isActive ? 'text-purple-400' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-white/[0.04] text-slate-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Reset Demo Data Button */}
      <div className="px-3 py-2 border-t border-white/[0.06]">
        <button
          onClick={resetDemoData}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-2.5 text-[11px] text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] rounded-lg transition-colors"
          title="Сбросить к исходным демо-данным"
        >
          <RotateCcw size={12} />
          <span>Сбросить демо-данные</span>
        </button>
      </div>

      {/* Bottom Profile Area */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0A0C10]">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#1C2028] border border-white/[0.1] flex items-center justify-center text-white font-semibold text-xs">
                АП
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#0A0C10]"></span>
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white tracking-tight leading-tight">
                Александр
              </div>
              <div className="text-[10px] text-slate-500">Freelancer</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
