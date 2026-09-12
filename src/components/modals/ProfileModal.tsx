import React from 'react';
import { X, User, Briefcase, Mail, Send, Award, Clock, DollarSign, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../utils/formatters';

export const ProfileModal: React.FC = () => {
  const { isProfileOpen, closeProfile, kpi, financialEfficiency, projects } = useApp();

  if (!isProfileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={closeProfile}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#11141A] border border-white/[0.1] rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">
            Профиль фрилансера
          </h3>
          <button
            onClick={closeProfile}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card Header */}
        <div className="p-5 border-b border-white/[0.06] bg-white/[0.01] flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-bold text-lg flex items-center justify-center shadow-lg shrink-0">
            АП
          </div>
          <div>
            <div className="text-base font-bold text-white">Александр Петров</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Senior Product & Brand Designer
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Открыт к проектам
              </span>
              <span className="text-[10px] text-slate-500">• 8 лет опыта</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                <DollarSign size={12} className="text-emerald-400" />
                Эффективная ставка
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {financialEfficiency.averageRate.toLocaleString('ru-RU')} ₽ / час
              </div>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                <Clock size={12} className="text-blue-400" />
                Отработано часов
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {financialEfficiency.totalLoggedHours} ч в проектах
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-slate-300">Прямые контакты</div>
            <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Send size={13} className="text-blue-400" />
                  Telegram:
                </span>
                <span className="text-blue-400 font-medium">@alex_petrov_brand</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" />
                  Email:
                </span>
                <span className="text-slate-300 font-medium">alex.petrov@brand.ru</span>
              </div>
            </div>
          </div>

          {/* Specialization */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-slate-300">Фокус и экспертиза</div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 bg-white/[0.04] text-slate-300 rounded-lg text-[11px] border border-white/[0.06]">
                Product Design
              </span>
              <span className="px-2.5 py-1 bg-white/[0.04] text-slate-300 rounded-lg text-[11px] border border-white/[0.06]">
                Brand Identity
              </span>
              <span className="px-2.5 py-1 bg-white/[0.04] text-slate-300 rounded-lg text-[11px] border border-white/[0.06]">
                Design Systems
              </span>
              <span className="px-2.5 py-1 bg-white/[0.04] text-slate-300 rounded-lg text-[11px] border border-white/[0.06]">
                Mobile Apps
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
          <span className="text-[11px] text-slate-500">FREELA Creator Profile</span>
          <button
            onClick={closeProfile}
            className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
