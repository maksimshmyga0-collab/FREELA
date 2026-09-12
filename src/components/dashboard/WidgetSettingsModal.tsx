import React from 'react';
import {
  X,
  SlidersHorizontal,
  FolderKanban,
  CheckSquare,
  TrendingUp,
  Clock,
  Calendar,
  DollarSign,
  Lightbulb,
  FileText,
  BarChart2,
  RotateCcw,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DashboardWidgetConfig } from '../../types';

interface WidgetItemMeta {
  id: keyof DashboardWidgetConfig;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  categoryColor: string;
}

const WIDGET_ITEMS: WidgetItemMeta[] = [
  {
    id: 'projects',
    title: 'Текущие проекты',
    description: 'Карточки активных проектов с дедлайнами, клиентами и прогрессом',
    icon: <FolderKanban size={16} className="text-blue-400" />,
    category: 'Работа',
    categoryColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    id: 'todayTasks',
    title: 'Задачи на сегодня',
    description: 'Список задач с чекбоксами для быстрого закрытия текущих шагов',
    icon: <CheckSquare size={16} className="text-emerald-400" />,
    category: 'Фокус',
    categoryColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'monthIncome',
    title: 'Доход за месяц',
    description: 'Сумма фактически полученных средств за текущий месяц',
    icon: <TrendingUp size={16} className="text-emerald-400" />,
    category: 'Финансы',
    categoryColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'pendingIncome',
    title: 'Ожидает оплаты',
    description: 'Сумма выставленных счетов и ожидаемых поступлений',
    icon: <Clock size={16} className="text-amber-400" />,
    category: 'Финансы',
    categoryColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    id: 'calendar',
    title: 'Календарь',
    description: 'Сетка месяца, инспектор задач и дедлайнов по конкретным дням',
    icon: <Calendar size={16} className="text-blue-400" />,
    category: 'Планирование',
    categoryColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    id: 'currency',
    title: 'Курсы валют',
    description: 'Онлайн-курсы USD и EUR к рублю со встроенным конвертером',
    icon: <DollarSign size={16} className="text-emerald-400" />,
    category: 'Рынок',
    categoryColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'ideas',
    title: 'Последние идеи',
    description: 'Банк идей для контента, лид-магнитов и клиентских предложений',
    icon: <Lightbulb size={16} className="text-amber-400" />,
    category: 'Создавай',
    categoryColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    id: 'content',
    title: 'Контент',
    description: 'Пайплайн публикаций для привлечения клиентов и ведения каналов',
    icon: <FileText size={16} className="text-indigo-400" />,
    category: 'Создавай',
    categoryColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  {
    id: 'results',
    title: 'Результаты',
    description: 'Фактические метрики охватов, конверсий и поступивших заявок',
    icon: <BarChart2 size={16} className="text-emerald-400" />,
    category: 'Создавай',
    categoryColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
];

export const WidgetSettingsModal: React.FC = () => {
  const {
    isWidgetModalOpen,
    setIsWidgetModalOpen,
    widgetConfig,
    setWidgetVisible,
    resetWidgetConfig,
  } = useApp();

  if (!isWidgetModalOpen) return null;

  const activeCount = Object.values(widgetConfig).filter(Boolean).length;
  const totalCount = WIDGET_ITEMS.length;

  const enableAll = () => {
    WIDGET_ITEMS.forEach((w) => {
      setWidgetVisible(w.id, true);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => setIsWidgetModalOpen(false)}
      />

      {/* Modal Card */}
      <div
        id="widget-settings-modal"
        className="relative w-full max-w-lg bg-[#11141A] border border-white/[0.1] rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* 1. Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Настройка виджетов</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                  {activeCount} из {totalCount} включено
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Включайте и отключайте блоки главной страницы
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWidgetModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Quick Actions Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-white/[0.02] border-b border-white/[0.04] flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Персональные настройки видимости
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={enableAll}
              className="text-[11px] font-medium text-slate-300 hover:text-white px-2 py-1 bg-white/[0.04] hover:bg-white/[0.08] rounded-md border border-white/[0.06] transition-colors"
            >
              Включить все
            </button>
            <button
              onClick={resetWidgetConfig}
              className="text-[11px] font-medium text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 hover:bg-white/[0.04] rounded-md transition-colors"
              title="Сбросить к исходным настройкам"
            >
              <RotateCcw size={11} />
              <span>Сбросить</span>
            </button>
          </div>
        </div>

        {/* 3. List of Widgets */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1 divide-y divide-white/[0.03]">
          {WIDGET_ITEMS.map((item) => {
            const isEnabled = Boolean(widgetConfig[item.id]);

            return (
              <div
                key={item.id}
                onClick={() => setWidgetVisible(item.id, !isEnabled)}
                className={`pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  isEnabled
                    ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                    : 'bg-white/[0.005] border-transparent opacity-60 hover:opacity-85'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-white">
                        {item.title}
                      </span>
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${item.categoryColor}`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <div className="shrink-0 pl-2">
                  <div
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      isEnabled ? 'bg-emerald-500' : 'bg-white/[0.1]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Safety & Persistence Notice */}
        <div className="px-4 sm:px-5 py-3 bg-white/[0.02] border-t border-white/[0.06] flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px] text-slate-400 leading-relaxed">
            Выключение виджета <span className="text-slate-200 font-medium">только скрывает его с главной</span>. Все проекты, задачи, финансы и идеи остаются в полной сохранности.
          </div>
        </div>

        {/* 5. Footer */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-end">
          <button
            id="close-widget-settings-modal-btn"
            onClick={() => setIsWidgetModalOpen(false)}
            className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
