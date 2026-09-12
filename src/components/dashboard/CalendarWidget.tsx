import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  FolderKanban,
  CheckSquare,
  ArrowRight,
  Plus,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, Project } from '../../types';

// Helper to parse dates in Russian text ("13 сентября 2026"), ISO ("2026-09-13"), or dot format ("13.09.2026")
const RU_MONTHS_MAP: Record<string, number> = {
  янв: 0,
  январ: 0,
  января: 0,
  фев: 1,
  феврал: 1,
  февраля: 1,
  мар: 2,
  март: 2,
  марта: 2,
  апр: 3,
  апрел: 3,
  апреля: 3,
  май: 4,
  мая: 4,
  июн: 5,
  июня: 5,
  июл: 6,
  июля: 6,
  авг: 7,
  август: 7,
  августа: 7,
  сен: 8,
  сент: 8,
  сентябр: 8,
  сентября: 8,
  окт: 9,
  октябр: 9,
  октября: 9,
  ноя: 10,
  ноябр: 10,
  ноября: 10,
  дек: 11,
  декабр: 11,
  декабря: 11,
};

function parseDate(dateStr?: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim().toLowerCase();

  // ISO: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
  }

  // DD.MM.YYYY
  const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (dotMatch) {
    return new Date(parseInt(dotMatch[3], 10), parseInt(dotMatch[2], 10) - 1, parseInt(dotMatch[1], 10));
  }

  // Russian text format: "13 сентября 2026" or "13 сентября"
  const textMatch = trimmed.match(/^(\d{1,2})\s+([а-яё]+)(?:\s+(\d{4}))?/);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const mKey = textMatch[2].slice(0, 3);
    const month = RU_MONTHS_MAP[mKey] ?? RU_MONTHS_MAP[textMatch[2]];
    const year = textMatch[3] ? parseInt(textMatch[3], 10) : new Date().getFullYear();
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }

  const fallback = new Date(dateStr);
  if (!isNaN(fallback.getTime())) return fallback;

  return null;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MONTH_NAMES_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const WEEKDAY_NAMES_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const CalendarWidget: React.FC = () => {
  const {
    tasks,
    projects,
    toggleTask,
    openEditModal,
    openCreateModal,
    setMainSection,
    setWorkTab,
  } = useApp();

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);

  // Current displayed month/year
  const [viewDate, setViewDate] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));
  // Selected date for details inspector
  const [selectedDate, setSelectedDate] = useState<Date>(() => today);

  const selectedDateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  // Map tasks and projects to date keys
  const { tasksByDate, projectsByDate } = useMemo(() => {
    const taskMap: Record<string, Task[]> = {};
    const projMap: Record<string, Project[]> = {};

    tasks.forEach((task) => {
      const parsed = parseDate(task.deadline);
      if (parsed) {
        const key = formatDateKey(parsed);
        if (!taskMap[key]) taskMap[key] = [];
        taskMap[key].push(task);
      }
    });

    projects.forEach((proj) => {
      const parsed = parseDate(proj.deadline);
      if (parsed) {
        const key = formatDateKey(parsed);
        if (!projMap[key]) projMap[key] = [];
        projMap[key].push(proj);
      }
    });

    return { tasksByDate: taskMap, projectsByDate: projMap };
  }, [tasks, projects]);

  // Month navigation
  const prevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Build calendar matrix (42 cells: 6 weeks x 7 days)
  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of current month
    const firstDay = new Date(year, month, 1);
    // Day of week in Russian: Monday=0, Sunday=6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{
      date: Date;
      dateKey: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      hasTasks: boolean;
      tasksCount: number;
      hasProjects: boolean;
      projectsCount: number;
    }> = [];

    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const date = new Date(year, month - 1, d);
      const key = formatDateKey(date);
      cells.push({
        date,
        dateKey: key,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: key === todayKey,
        isSelected: key === selectedDateKey,
        hasTasks: Boolean(tasksByDate[key]?.length),
        tasksCount: tasksByDate[key]?.length || 0,
        hasProjects: Boolean(projectsByDate[key]?.length),
        projectsCount: projectsByDate[key]?.length || 0,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = formatDateKey(date);
      cells.push({
        date,
        dateKey: key,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: key === todayKey,
        isSelected: key === selectedDateKey,
        hasTasks: Boolean(tasksByDate[key]?.length),
        tasksCount: tasksByDate[key]?.length || 0,
        hasProjects: Boolean(projectsByDate[key]?.length),
        projectsCount: projectsByDate[key]?.length || 0,
      });
    }

    // Next month padding to fill grid (35 or 42)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      const key = formatDateKey(date);
      cells.push({
        date,
        dateKey: key,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: key === todayKey,
        isSelected: key === selectedDateKey,
        hasTasks: Boolean(tasksByDate[key]?.length),
        tasksCount: tasksByDate[key]?.length || 0,
        hasProjects: Boolean(projectsByDate[key]?.length),
        projectsCount: projectsByDate[key]?.length || 0,
      });
    }

    return cells;
  }, [viewDate, todayKey, selectedDateKey, tasksByDate, projectsByDate]);

  // Items for selected day
  const selectedDayTasks = tasksByDate[selectedDateKey] || [];
  const selectedDayProjects = projectsByDate[selectedDateKey] || [];
  const totalItemsCount = selectedDayTasks.length + selectedDayProjects.length;

  const formattedSelectedDateText = useMemo(() => {
    return selectedDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  return (
    <div
      id="calendar-widget"
      className="bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all flex flex-col justify-between h-full"
    >
      {/* 1. Header: Title, Current Month and Controls */}
      <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <CalendarIcon size={16} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Календарь</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                {MONTH_NAMES_RU[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Дедлайны проектов и задачи по дням
            </p>
          </div>
        </div>

        {/* Month controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="calendar-today-btn"
            onClick={goToToday}
            className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg border border-white/[0.08] transition-colors"
            title="Перейти к сегодняшнему дню"
          >
            Сегодня
          </button>
          <div className="flex items-center gap-0.5">
            <button
              id="calendar-prev-month-btn"
              onClick={prevMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              id="calendar-next-month-btn"
              onClick={nextMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
              aria-label="Следующий месяц"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content: Month Grid (Left/Top) + Day Tasks Panel (Right/Bottom) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-3.5 items-stretch flex-1">
        {/* Left column: Calendar Grid */}
        <div className="md:col-span-7 flex flex-col justify-between">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEKDAY_NAMES_RU.map((day, idx) => (
              <div
                key={day}
                className={`text-[11px] font-semibold py-1 ${
                  idx >= 5 ? 'text-rose-400/80' : 'text-slate-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell) => {
              const hasActivity = cell.hasTasks || cell.hasProjects;

              return (
                <button
                  key={cell.dateKey}
                  onClick={() => {
                    setSelectedDate(cell.date);
                    // If clicking a day from another month, adjust viewDate
                    if (!cell.isCurrentMonth) {
                      setViewDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                    }
                  }}
                  className={`relative py-1.5 px-0.5 sm:py-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all min-h-[36px] ${
                    cell.isSelected
                      ? 'bg-white text-slate-950 font-bold shadow-md shadow-black/20'
                      : cell.isToday
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                      : cell.isCurrentMonth
                      ? 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                      : 'text-slate-600 hover:bg-white/[0.02]'
                  }`}
                  title={`${cell.dateKey}${hasActivity ? ` (${cell.tasksCount + cell.projectsCount} событий)` : ''}`}
                >
                  <span className="leading-none">{cell.dayNumber}</span>

                  {/* Dots / Indicators */}
                  {hasActivity && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {cell.hasTasks && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cell.isSelected ? 'bg-slate-900' : 'bg-emerald-400'
                          }`}
                        />
                      )}
                      {cell.hasProjects && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cell.isSelected ? 'bg-indigo-900' : 'bg-purple-400'
                          }`}
                        />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-white/[0.04] text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>Сегодня</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Задачи</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              <span>Дедлайны проектов</span>
            </div>
          </div>
        </div>

        {/* Right column: Selected Day Tasks and Deadlines Inspector */}
        <div className="md:col-span-5 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            {/* Day Header */}
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <div>
                <div className="text-xs font-bold text-white capitalize">
                  {formattedSelectedDateText}
                </div>
                <div className="text-[10px] text-slate-400">
                  {selectedDateKey === todayKey ? 'Сегодня' : 'Выбранный день'}
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.06]">
                {totalItemsCount} {totalItemsCount === 1 ? 'событие' : totalItemsCount >= 2 && totalItemsCount <= 4 ? 'события' : 'событий'}
              </span>
            </div>

            {/* List of items */}
            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {/* Project Deadlines */}
              {selectedDayProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => openEditModal('project', project)}
                  className="p-2 bg-purple-500/[0.06] hover:bg-purple-500/[0.12] border border-purple-500/20 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FolderKanban size={13} className="text-purple-400 shrink-0" />
                      <span className="text-[11px] font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                        {project.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded shrink-0">
                      Дедлайн
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{project.clientName}</span>
                    <span className="text-slate-300 font-medium">{project.cost.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              ))}

              {/* Tasks */}
              {selectedDayTasks.map((task) => {
                const priorityColor = {
                  Срочный: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                  Высокий: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                  Средний: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  Низкий: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
                }[task.priority] || 'text-slate-400';

                return (
                  <div
                    key={task.id}
                    className="p-2 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] rounded-lg transition-colors flex items-start justify-between gap-2 group"
                  >
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(task.id);
                        }}
                        className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                        title={task.completed ? 'Пометить как невыполненную' : 'Завершить задачу'}
                      >
                        {task.completed ? (
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        ) : (
                          <Circle size={14} />
                        )}
                      </button>
                      <div
                        onClick={() => openEditModal('task', task)}
                        className="min-w-0 cursor-pointer flex-1"
                      >
                        <div
                          className={`text-[11px] font-medium leading-snug group-hover:text-blue-300 transition-colors ${
                            task.completed ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                          <span>{task.projectName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${priorityColor}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Empty state */}
              {totalItemsCount === 0 && (
                <div className="text-center py-6 px-2">
                  <div className="w-8 h-8 rounded-full bg-white/[0.03] text-slate-500 flex items-center justify-center mx-auto mb-2">
                    <Clock size={15} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    На этот день дедлайнов нет
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Свободный день или время для генерации идей
                  </p>
                  <button
                    onClick={() =>
                      openCreateModal('task', {
                        deadline: formattedSelectedDateText,
                      })
                    }
                    className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg border border-white/[0.08] transition-colors"
                  >
                    <Plus size={12} className="text-blue-400" />
                    <span>Добавить задачу</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick link to Work section */}
          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
            <button
              onClick={() => {
                setMainSection('work');
                setWorkTab('tasks');
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Все задачи ({tasks.length})</span>
              <ArrowRight size={11} />
            </button>
            <button
              onClick={() => {
                setMainSection('work');
                setWorkTab('projects');
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Проекты ({projects.length})</span>
              <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Footer info note */}
      <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400">
        <span>Кликните по дню в календаре для просмотра задач</span>
        <span className="text-emerald-400 font-medium">
          Активных задач: {tasks.filter((t) => !t.completed).length}
        </span>
      </div>
    </div>
  );
};
