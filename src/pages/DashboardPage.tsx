import React from 'react';
import {
  TrendingUp,
  Clock,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Calendar,
  Sparkles,
  Lightbulb,
  FileText,
  Brain,
  Zap,
  DollarSign,
  ArrowRight,
  Check,
  AlertTriangle,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatMoney, statusColors } from '../utils/formatters';
import { FinanceChart } from '../components/common/FinanceChart';
import { CalendarWidget } from '../components/dashboard/CalendarWidget';
import { CurrencyWidget } from '../components/dashboard/CurrencyWidget';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    kpi,
    projects,
    tasks,
    finance,
    ideas,
    content,
    results,
    financialEfficiency,
    nextSteps,
    toggleTask,
    setMainSection,
    setWorkTab,
    setCreatorTab,
    openCreateModal,
    openEditModal,
    openCaseStudy,
    widgetConfig,
    setIsWidgetModalOpen,
  } = useApp();

  const userFirstName = currentUser?.displayName
    ? currentUser.displayName.split(' ')[0]
    : 'Фрилансер';

  // Filter projects in active work
  const projectsInWork = projects.filter(
    (p) => p.status === 'В работе' || p.status === 'На согласовании' || p.status === 'Ожидает оплаты'
  );

  // Filter active tasks (sorted: urgency first, then not completed)
  const activeTasks = [...tasks]
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pWeight = { Срочный: 4, Высокий: 3, Средний: 2, Низкий: 1 };
      return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
    })
    .slice(0, 5);

  // Representative project for efficiency calculation
  const featuredEfficiencyProject =
    projects.find((p) => p.hoursSpent && p.hoursSpent > 0) || projects[0];
  const featuredHourlyRate =
    featuredEfficiencyProject && featuredEfficiencyProject.hoursSpent
      ? Math.round(featuredEfficiencyProject.cost / featuredEfficiencyProject.hoursSpent)
      : currentUser?.hourlyRate || 3500;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Greeting & Quick Actions Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Привет, {userFirstName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-normal">
            Готов к новым результатам?
          </p>
        </div>

        {/* Quick Actions Strip & Widget Customization */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <button
            id="customize-widgets-btn"
            onClick={() => setIsWidgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-all min-h-[34px] cursor-pointer"
            title="Настроить виджеты главной страницы"
          >
            <SlidersHorizontal size={13} className="text-blue-400" />
            <span>Настроить виджеты</span>
          </button>

          <div className="h-4 w-px bg-white/[0.08] hidden sm:block mx-0.5" />

          <button
            onClick={() => openCreateModal('project')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium rounded-xl border border-white/[0.08] transition-all min-h-[34px]"
          >
            <Plus size={13} className="text-blue-400" />
            <span>Проект</span>
          </button>
          <button
            onClick={() => openCreateModal('client')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium rounded-xl border border-white/[0.08] transition-all min-h-[34px]"
          >
            <Plus size={13} className="text-emerald-400" />
            <span>Клиент</span>
          </button>
          <button
            onClick={() => openCreateModal('task')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium rounded-xl border border-white/[0.08] transition-all min-h-[34px]"
          >
            <Plus size={13} className="text-purple-400" />
            <span>Задача</span>
          </button>
          <button
            onClick={() => openCreateModal('finance')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium rounded-xl border border-white/[0.08] transition-all min-h-[34px]"
          >
            <Plus size={13} className="text-amber-400" />
            <span>Операция</span>
          </button>
          <button
            onClick={() => openCreateModal('idea')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] min-h-[34px]"
          >
            <Plus size={13} />
            <span>Идея</span>
          </button>
        </div>
      </div>

      {/* 2. Compact KPI Cards (Пункт 3 & Настройка виджетов) */}
      <div
        className={`grid gap-3 sm:gap-4 ${
          (widgetConfig.monthIncome ? 1 : 0) + (widgetConfig.pendingIncome ? 1 : 0) + 2 === 4
            ? 'grid-cols-2 lg:grid-cols-4'
            : (widgetConfig.monthIncome ? 1 : 0) + (widgetConfig.pendingIncome ? 1 : 0) + 2 === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {/* KPI 1: Доход за месяц */}
        {widgetConfig.monthIncome && (
          <div
            onClick={() => setMainSection('finance')}
            className="bg-[#11141A] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Доход</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {formatMoney(kpi.income)}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <ArrowUpRight size={12} />
                Оплачено в сентябре
              </div>
            </div>
          </div>
        )}

        {/* KPI 2: Ожидает оплаты */}
        {widgetConfig.pendingIncome && (
          <div
            onClick={() => setMainSection('finance')}
            className="bg-[#11141A] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Ожидает оплаты</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock size={14} />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {formatMoney(kpi.waitingPayment)}
              </div>
              <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                2 счета к получению
              </div>
            </div>
          </div>
        )}

        {/* KPI 3: Проекты в работе */}
        <div
          onClick={() => {
            setMainSection('work');
            setWorkTab('projects');
          }}
          className="bg-[#11141A] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Проекты в работе</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {kpi.activeProjects}
            </div>
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
              Активных контрактов
            </div>
          </div>
        </div>

        {/* KPI 4: Текущие задачи */}
        <div
          onClick={() => {
            setMainSection('work');
            setWorkTab('tasks');
          }}
          className="bg-[#11141A] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Текущие задачи</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {kpi.pendingTasks}
            </div>
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
              В фокусе на сегодня
            </div>
          </div>
        </div>
      </div>

      {/* 3. Блок «Следующий шаг» (Что делать дальше?) (Пункт 11) */}
      <div className="bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Zap size={14} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Следующий шаг
              </h2>
            </div>
          </div>
          <span className="text-[11px] text-slate-500">
            Приоритеты на основе дедлайнов и финансов
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {nextSteps.map((step) => {
            const urgencyStyles = {
              critical: 'border-rose-500/20 bg-rose-500/[0.03] text-rose-400',
              warning: 'border-amber-500/20 bg-amber-500/[0.03] text-amber-400',
              info: 'border-blue-500/20 bg-blue-500/[0.03] text-blue-400',
              success: 'border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-400',
            }[step.urgency];

            return (
              <div
                key={step.id}
                className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${urgencyStyles}`}
                    >
                      {step.badge}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white leading-snug">
                    {step.title}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {step.reason}
                  </p>
                </div>

                <button
                  onClick={step.onClick}
                  className="w-full py-1.5 px-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-white text-[11px] font-medium rounded-lg border border-white/[0.08] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{step.actionText}</span>
                  <ArrowRight size={12} className="text-slate-400" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Main Work Panels: Текущие проекты + Задачи на сегодня */}
      {(widgetConfig.projects || widgetConfig.todayTasks) && (
        <div
          className={`grid gap-5 items-stretch ${
            widgetConfig.projects && widgetConfig.todayTasks
              ? 'grid-cols-1 lg:grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {/* Panel 1: Текущие проекты (Пункт 4) */}
          {widgetConfig.projects && (
            <div className="bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Текущие проекты
              </h2>
              <p className="text-[11px] text-slate-400">
                Коммерческие контракты в активной фазе
              </p>
            </div>
            <button
              onClick={() => {
                setMainSection('work');
                setWorkTab('projects');
              }}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
            >
              Все проекты ({projects.length}) →
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {projectsInWork.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/[0.08] flex flex-col items-center justify-center h-full min-h-[200px]">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
                  <Briefcase size={16} />
                </div>
                <div className="text-xs font-semibold text-slate-200">Пока здесь ничего нет</div>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Создайте первый проект, чтобы начать учет сроков, этапов и стоимости
                </p>
                <button
                  onClick={() => openCreateModal('project')}
                  className="mt-3 px-3 py-1.5 bg-white text-slate-950 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={13} />
                  Создать первый проект
                </button>
              </div>
            ) : (
              projectsInWork.map((proj) => {
                const statusConfig = statusColors[proj.status] || {
                  bg: 'bg-white/[0.04]',
                  text: 'text-slate-400',
                  dot: 'bg-slate-500',
                };
                const projectTasksCount = tasks.filter((t) => t.projectId === proj.id).length;

                return (
                  <div
                    key={proj.id}
                    className="p-3.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/[0.04] hover:border-white/[0.1] transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => openEditModal('project', proj)}
                      >
                        <div className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                          {proj.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {proj.clientName} • {projectTasksCount} задач
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-white">
                          {formatMoney(proj.cost)}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border mt-1 ${statusConfig.bg}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${statusConfig.dot}`}></span>
                          {proj.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between gap-3 text-[11px]">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar size={11} className="text-slate-500" />
                        {proj.deadline}
                      </span>
                      <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                        <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-slate-300 shrink-0">
                          {proj.progress}%
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCaseStudy(proj);
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-medium px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500/20 rounded-md border border-purple-500/20 transition-colors shrink-0"
                      >
                        Кейс
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Panel 2: Задачи на сегодня (Пункт 5) */}
      {widgetConfig.todayTasks && (
        <div className="bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Задачи на сегодня
              </h2>
              <p className="text-[11px] text-slate-400">
                Главные шаги к завершению этапов
              </p>
            </div>
            <button
              onClick={() => {
                setMainSection('work');
                setWorkTab('tasks');
              }}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
            >
              Все задачи ({tasks.length}) →
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {activeTasks.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/[0.08] flex flex-col items-center justify-center h-full min-h-[200px]">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                  <Check size={16} />
                </div>
                <div className="text-xs font-semibold text-slate-200">Пока здесь ничего нет</div>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Все задачи выполнены или еще не созданы. Добавьте задачу в проект
                </p>
                <button
                  onClick={() => openCreateModal('task')}
                  className="mt-3 px-3 py-1.5 bg-white text-slate-950 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={13} />
                  Добавить задачу
                </button>
              </div>
            ) : (
              activeTasks.map((task) => {
                const priorityConfig = statusColors[task.priority] || {
                  bg: 'bg-white/[0.04]',
                  text: 'text-slate-400',
                };
                return (
                  <div
                    key={task.id}
                    className="p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/[0.04] hover:border-white/[0.1] transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Discrete checkbox toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(task.id);
                        }}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors min-w-[20px] ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-white/[0.2] hover:border-white/[0.4] bg-transparent'
                        }`}
                        aria-label="Переключить статус"
                      >
                        {task.completed && <CheckCircle2 size={12} />}
                      </button>

                      <div
                        className="min-w-0 cursor-pointer flex-1"
                        onClick={() => openEditModal('task', task)}
                      >
                        <div
                          className={`text-xs font-medium truncate ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="truncate">{task.projectName}</span>
                          <span>•</span>
                          <span className="shrink-0">{task.deadline}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium border shrink-0 ${priorityConfig.bg}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
        </div>
      )}

      {/* 4.5. Widgets Row: Календарь & Курсы валют (Этап 1 & 2) */}
      {(widgetConfig.calendar || widgetConfig.currency) && (
        <div
          className={`grid gap-5 items-stretch ${
            widgetConfig.calendar && widgetConfig.currency
              ? 'grid-cols-1 lg:grid-cols-12'
              : 'grid-cols-1'
          }`}
        >
          {widgetConfig.calendar && (
            <div
              className={`${
                widgetConfig.currency
                  ? 'lg:col-span-7 xl:col-span-8'
                  : 'col-span-1'
              } flex flex-col`}
            >
              <CalendarWidget />
            </div>
          )}
          {widgetConfig.currency && (
            <div
              className={`${
                widgetConfig.calendar
                  ? 'lg:col-span-5 xl:col-span-4'
                  : 'col-span-1'
              } flex flex-col`}
            >
              <CurrencyWidget />
            </div>
          )}
        </div>
      )}

      {/* 5. Section: Финансы & Финансовая эффективность + FREELA Insights (Пункт 10 & 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 cols: Финансы panel with metrics & chart & efficiency card */}
        <div className="lg:col-span-2 bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Финансовый поток
              </h2>
              <p className="text-[11px] text-slate-400">
                Динамика доходов, расходов и чистой прибыли
              </p>
            </div>
            <button
              onClick={() => setMainSection('finance')}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
            >
              Подробно →
            </button>
          </div>

          {/* 4 Financial Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div>
              <span className="text-[10px] font-medium text-slate-400">Доход (факт)</span>
              <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                {formatMoney(kpi.income)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400">Расходы</span>
              <div className="text-sm sm:text-base font-bold text-slate-300 mt-0.5">
                {formatMoney(kpi.expenses)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400">Ожидает оплаты</span>
              <div className="text-sm sm:text-base font-bold text-amber-400 mt-0.5">
                {formatMoney(kpi.waitingPayment)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400">Чистая прибыль</span>
              <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
                {formatMoney(kpi.balance)}
              </div>
            </div>
          </div>

          {/* Minimalist Chart */}
          <FinanceChart records={finance} />

          {/* Финансовая эффективность (Пункт 12) */}
          <div className="p-3.5 bg-gradient-to-r from-blue-500/[0.05] to-emerald-500/[0.05] rounded-xl border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign size={16} />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  Финансовая эффективность (Эффективная ставка)
                </div>
                {featuredEfficiencyProject ? (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {featuredEfficiencyProject.title}: {formatMoney(featuredEfficiencyProject.cost)} / {featuredEfficiencyProject.hoursSpent || 1} ч ={' '}
                    <span className="text-emerald-400 font-bold">
                      {featuredHourlyRate.toLocaleString('ru-RU')} ₽ / час
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Базовая ставка:{' '}
                    <span className="text-emerald-400 font-bold">
                      {featuredHourlyRate.toLocaleString('ru-RU')} ₽ / час
                    </span>
                    . Учет фактической ставки начнется с завершением проектов.
                  </div>
                )}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400 shrink-0">
              Средняя по проектам:{' '}
              <span className="text-white font-semibold">
                {financialEfficiency.averageRate.toLocaleString('ru-RU')} ₽/ч
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 col: FREELA Insights (Пункт 10) */}
        <div className="bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Brain size={14} />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                FREELA Insights
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              Аналитический слой на основе твоих реальных данных
            </p>
          </div>

          <div className="space-y-3">
            {/* Insight 1 */}
            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5 text-xs font-bold">↑</span>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Проекты из категории <span className="text-white font-medium">«Дизайн»</span> в среднем приносят на <span className="text-emerald-400 font-semibold">34% больше</span>.
                </p>
              </div>
            </div>

            {/* Insight 2 */}
            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
              <div className="flex items-start gap-2.5">
                <span className="text-blue-400 mt-0.5 text-xs font-bold">⚡</span>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  После публикации контента чаще всего появляются <span className="text-white font-medium">2–3 заявки</span> в течение <span className="text-blue-400 font-semibold">48 часов</span>.
                </p>
              </div>
            </div>

            {/* Insight 3 */}
            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
              <div className="flex items-start gap-2.5">
                <span className="text-amber-400 mt-0.5 text-xs font-bold">◈</span>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Доход вырос, но количество активных проектов также увеличилось на <span className="text-amber-400 font-semibold">80%</span>. Пора повышать базовый чек.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] text-[10px] text-slate-500 flex items-center justify-between">
            <span>Синхронизировано с базой</span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Активный расчет
            </span>
          </div>
        </div>
      </div>

      {/* 6. Section: Продуктовая связка Результата & Раздел «Создавай» (Пункт 9, 25, 8 & Настройка виджетов) */}
      {(widgetConfig.ideas || widgetConfig.content || widgetConfig.results) && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                Создавай и превращай активность в результат
              </h2>
              <p className="text-[11px] text-slate-400">
                «Идея → Контент → Аудитория → Результат»
              </p>
            </div>
            <button
              onClick={() => setMainSection('creator')}
              className="text-[11px] text-purple-400 hover:text-purple-300 font-medium"
            >
              В раздел «Создавай» →
            </button>
          </div>

          <div
            className={`grid gap-3.5 ${
              [widgetConfig.ideas, widgetConfig.content, widgetConfig.results].filter(Boolean).length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : [widgetConfig.ideas, widgetConfig.content, widgetConfig.results].filter(Boolean).length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            {/* Card 1: 💡 Идеи */}
            {widgetConfig.ideas && (
              <div
                onClick={() => {
                  setMainSection('creator');
                  setCreatorTab('ideas');
                }}
                className="bg-[#11141A] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm">
                      💡
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-white/[0.04] text-slate-300 rounded-full border border-white/[0.06]">
                      {ideas.length} в банке
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                    Банк идей
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {ideas[0]?.title || 'Генерация тем для Reels, статей и лид-магнитов'}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400 group-hover:text-white transition-colors">
                  <span>Открыть идеи</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            )}

            {/* Card 2: 📝 Контент */}
            {widgetConfig.content && (
              <div
                onClick={() => {
                  setMainSection('creator');
                  setCreatorTab('content');
                }}
                className="bg-[#11141A] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm">
                      📝
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-white/[0.04] text-slate-300 rounded-full border border-white/[0.06]">
                      {content.length} материалов
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                    Пайплайн контента
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {content[0]?.title || 'Производство Reels, постов и экспертных статей'}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400 group-hover:text-white transition-colors">
                  <span>Управление контентом</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            )}

            {/* Card 3: 📊 Результаты */}
            {widgetConfig.results && (
              <div
                onClick={() => {
                  setMainSection('creator');
                  setCreatorTab('results');
                }}
                className="bg-[#11141A] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm">
                      📊
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-white/[0.04] text-slate-300 rounded-full border border-white/[0.06]">
                      {results.length} метрик
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    Фактический результат
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {results[0]?.title || 'Конверсия публикаций в заявки и оплаченные контракты'}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400 group-hover:text-white transition-colors">
                  <span>Смотреть конверсию</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
