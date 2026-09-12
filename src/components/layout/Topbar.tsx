import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Menu,
  Check,
  FolderKanban,
  CheckSquare,
  Users,
  Wallet,
  Lightbulb,
  FileText,
  Briefcase,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MainNavSection } from '../../types';

export const Topbar: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    mainSection,
    setMainSection,
    setIsMobileMenuOpen,
    openSearch,
    openProfile,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    openCreateModal,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setShowQuickCreate(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: MainNavSection; label: string }[] = [
    { id: 'dashboard', label: 'Главная' },
    { id: 'work', label: 'Работа' },
    { id: 'creator', label: 'Создание' },
    { id: 'finance', label: 'Финансы' },
  ];

  return (
    <header
      id="freela-topbar"
      className="sticky top-0 z-30 h-14 bg-[#0A0C10]/95 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-4 select-none"
    >
      {/* Left: Brand Logo & Main Navigation */}
      <div className="flex items-center gap-6 lg:gap-8">
        {/* Mobile menu trigger */}
        <button
          id="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
          aria-label="Открыть меню"
        >
          <Menu size={20} />
        </button>

        {/* Brand Logo */}
        <div
          onClick={() => setMainSection('dashboard')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-white text-slate-950 font-black text-xs flex items-center justify-center tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
            FR
          </div>
          <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
            FREELA
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </span>
        </div>

        {/* Desktop Top Navigation Tabs: Главная | Работа | Финансы | Создавай */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = mainSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setMainSection(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all relative ${
                  isActive
                    ? 'text-white bg-white/[0.08] font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Search, Quick Create, Notifications, Settings, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Search button / input shortcut */}
        <button
          id="global-search-btn"
          onClick={openSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 rounded-xl border border-white/[0.06] hover:border-white/[0.15] text-xs transition-all min-h-[34px]"
        >
          <Search size={14} className="text-slate-400" />
          <span className="hidden sm:inline">Поиск</span>
          <kbd className="hidden lg:inline-block text-[10px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
            ⌘K
          </kbd>
        </button>

        {/* Quick Create Dropdown */}
        <div className="relative" ref={createRef}>
          <button
            id="quick-create-btn"
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-950 hover:bg-slate-200 active:scale-[0.98] text-xs font-semibold rounded-xl shadow-xs transition-all min-h-[34px]"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Создать</span>
          </button>

          {showQuickCreate && (
            <div className="absolute right-0 mt-2 w-52 bg-[#12151C] rounded-2xl shadow-2xl border border-white/[0.08] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-white/[0.06]">
                Быстрое действие
              </div>
              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  openCreateModal('project');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white font-medium transition-colors text-left"
              >
                <FolderKanban size={14} className="text-blue-400" />
                <span>Новый проект</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  openCreateModal('client');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white font-medium transition-colors text-left"
              >
                <Users size={14} className="text-emerald-400" />
                <span>Новый клиент</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  openCreateModal('task');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white font-medium transition-colors text-left"
              >
                <CheckSquare size={14} className="text-purple-400" />
                <span>Новая задача</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  openCreateModal('finance');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white font-medium transition-colors text-left"
              >
                <Wallet size={14} className="text-amber-400" />
                <span>Финансовая операция</span>
              </button>
              <div className="border-t border-white/[0.06] my-1"></div>
              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  openCreateModal('idea');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white font-medium transition-colors text-left"
              >
                <Lightbulb size={14} className="text-amber-400" />
                <span>Идея для блога</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  openCreateModal('content');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white font-medium transition-colors text-left"
              >
                <FileText size={14} className="text-indigo-400" />
                <span>Единица контента</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center"
            aria-label="Уведомления"
          >
            <Bell size={17} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-[#0A0C10]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#12151C] rounded-2xl shadow-2xl border border-white/[0.08] py-3 z-50 animate-in fade-in duration-100">
              <div className="px-4 pb-2.5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="text-xs font-bold text-white">Уведомления</div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <Check size={12} />
                    Прочитать все
                  </button>
                )}
              </div>

              <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto dark-scrollbar">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-white/[0.04] transition-colors ${
                      !n.read ? 'bg-white/[0.02]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <button
          id="user-profile-btn"
          onClick={openProfile}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1C2028] to-[#252B36] border border-white/[0.1] text-white font-bold text-xs flex items-center justify-center hover:border-white/[0.3] transition-all cursor-pointer select-none ml-0.5"
          aria-label="Профиль"
          title={currentUser ? `Профиль: ${currentUser.displayName}` : 'Профиль'}
        >
          {currentUser?.displayName
            ? currentUser.displayName
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
            : 'FL'}
        </button>
      </div>
    </header>
  );
};
