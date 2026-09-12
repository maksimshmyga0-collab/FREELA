import React from 'react';
import {
  TrendingUp,
  Plus,
  ArrowUpRight,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ResultsPage: React.FC = () => {
  const { results, openCreateModal, openEditModal } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp size={22} className="text-emerald-400" />
            Результаты
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-normal">
            Финальная конверсия креативных действий в охваты, подписчиков и реальные контракты
          </p>
        </div>
        <button
          onClick={() => openCreateModal('result')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all min-h-[40px]"
        >
          <Plus size={16} />
          Зафиксировать результат
        </button>
      </div>

      {/* Hero Metric Banner */}
      <div className="bg-[#11141A] text-white p-5 sm:p-6 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles size={13} />
            Главный фокус
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1 tracking-tight">
            Действие → Контент → Деньги
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xl leading-relaxed font-normal">
            Каждая единица контента в FREELA должна иметь измеримый результат: сколько клиентов
            пришло, какие лиды получены и сколько выручки сгенерировано.
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-6 shrink-0">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {results.length > 0 ? (results.length * 12.5).toFixed(1) + 'K' : '0'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Суммарный охват</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight">
              {results.length > 0 ? `${results.length * 2} лидов` : '0 лидов'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Заявок на проекты</div>
          </div>
        </div>
      </div>

      {/* Results Cards */}
      {results.length === 0 ? (
        <div className="bg-[#11141A] rounded-2xl p-12 text-center border border-white/[0.06]">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={22} />
          </div>
          <h3 className="text-sm font-bold text-white">Пока здесь ничего нет</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-normal">
            Зафиксируйте первые охваты, конверсии, лиды или выручку от публикаций контента
          </p>
          <button
            onClick={() => openCreateModal('result')}
            className="mt-4 px-4 py-2 bg-white text-slate-950 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            Зафиксировать результат
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((res) => {
          return (
            <div
              key={res.id}
              onClick={() => openEditModal('result', res)}
              className="bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.14] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-white leading-snug group-hover:text-emerald-400 transition-colors">
                      {res.title}
                    </h3>
                    {res.contentTitle && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-normal mt-1">
                        <FileText size={11} className="text-slate-500 shrink-0" />
                        <span className="truncate text-[11px]">Источник: {res.contentTitle}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-bold text-white block">
                      {res.metricValue}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center justify-end gap-0.5 mt-0.5">
                      <ArrowUpRight size={12} />
                      {res.change}
                    </span>
                  </div>
                </div>

                {res.notes && (
                  <p className="text-xs text-slate-400 mt-3 p-2.5 bg-white/[0.02] rounded-xl leading-relaxed border border-white/[0.04] font-normal">
                    {res.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Calendar size={11} />
                  {res.date}
                </span>
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {res.metricName}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
