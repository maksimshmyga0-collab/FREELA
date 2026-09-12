import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Eye,
  TrendingUp,
  ExternalLink,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { statusColors } from '../utils/formatters';

export const ContentPage: React.FC = () => {
  const { content, openCreateModal, openEditModal, searchQuery } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>('');

  const statuses = ['all', 'Черновик', 'Производство', 'Готово', 'Опубликовано'];

  const filteredContent = useMemo(() => {
    const q = (searchQuery || localSearch).toLowerCase().trim();
    return content.filter((item) => {
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.platform.toLowerCase().includes(q) ||
        item.ideaTitle?.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [content, selectedStatus, searchQuery, localSearch]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText size={22} className="text-indigo-400" />
            Контент
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-normal">
            План публикаций, производство материалов и привязка к идеям
          </p>
        </div>
        <button
          onClick={() => openCreateModal('content')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all min-h-[40px]"
        >
          <Plus size={16} />
          Создать контент
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-[#11141A] p-3 rounded-2xl border border-white/[0.06] space-y-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((st) => {
            const isActive = selectedStatus === st;
            const count =
              st === 'all'
                ? content.length
                : content.filter((c) => c.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white/[0.12] text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{st === 'all' ? 'Все статусы' : st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/[0.05] text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Local search */}
        <div className="relative w-full">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Фильтр по названию или платформе..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.03] hover:bg-white/[0.06] focus:bg-[#151922] text-white placeholder:text-slate-500 rounded-xl border border-white/[0.06] focus:border-white/[0.2] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Content Cards Grid */}
      {filteredContent.length === 0 ? (
        <div className="bg-[#11141A] rounded-2xl p-12 text-center border border-white/[0.06]">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <FileText size={22} />
          </div>
          <h3 className="text-sm font-bold text-white">Пока здесь ничего нет</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-normal">
            Создайте план для Reels, экспертного поста, Telegram-статьи или кейса
          </p>
          <button
            onClick={() => openCreateModal('content')}
            className="mt-4 px-4 py-2 bg-white text-slate-950 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            Создать контент
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => {
          const statusConfig = statusColors[item.status] || {
            bg: 'bg-white/[0.04]',
            text: 'text-slate-400',
            dot: 'bg-slate-500',
          };

          return (
            <div
              key={item.id}
              onClick={() => openEditModal('content', item)}
              className="bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.14] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1.5 ${statusConfig.bg}`}
                  >
                    <span className={`w-1 h-1 rounded-full ${statusConfig.dot}`}></span>
                    {item.status}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white/[0.04] text-slate-300 border border-white/[0.06] rounded-md">
                    {item.platform}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>

                {item.ideaTitle && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 p-2 rounded-xl mt-2.5 border border-amber-500/20">
                    <Lightbulb size={12} className="shrink-0 text-amber-400" />
                    <span className="truncate text-[11px]">Идея: {item.ideaTitle}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Calendar size={11} />
                  {item.publishDate}
                </span>

                {item.views ? (
                  <span className="flex items-center gap-1 font-bold text-white text-xs">
                    <Eye size={12} className="text-slate-400" />
                    {item.views.toLocaleString('ru-RU')}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">В плане</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
