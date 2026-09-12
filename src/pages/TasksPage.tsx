import React, { useState, useMemo } from 'react';
import { Plus, Search, CheckSquare, CheckCircle2, Calendar, FolderKanban } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskStatus, TaskPriority } from '../types';
import { statusColors } from '../utils/formatters';

export const TasksPage: React.FC = () => {
  const { tasks, toggleTask, openCreateModal, openEditModal, searchQuery } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>('');

  const filteredTasks = useMemo(() => {
    const q = (searchQuery || localSearch).toLowerCase().trim();
    return tasks.filter((t) => {
      const matchStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'active'
          ? !t.completed
          : selectedStatus === 'completed'
          ? t.completed
          : t.status === selectedStatus;

      const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority;

      const matchQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q);

      return matchStatus && matchPriority && matchQuery;
    });
  }, [tasks, selectedStatus, selectedPriority, searchQuery, localSearch]);

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare size={22} className="text-purple-400" />
            Задачи
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-normal">
            Детализация этапов по проектам с контролем приоритетов
          </p>
        </div>
        <button
          onClick={() => openCreateModal('task')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all min-h-[40px]"
        >
          <Plus size={16} />
          Новая задача
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-[#11141A] p-3 rounded-2xl border border-white/[0.06] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === 'all'
                  ? 'bg-white/[0.12] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Все ({tasks.length})
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === 'active'
                  ? 'bg-white/[0.12] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              В работе ({activeCount})
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === 'completed'
                  ? 'bg-white/[0.12] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Выполненные ({completedCount})
            </button>
          </div>

          {/* Priority dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Приоритет:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs font-medium bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
            >
              <option value="all" className="bg-[#11141A] text-white">Любой</option>
              <option value="Срочный" className="bg-[#11141A] text-white">Срочный</option>
              <option value="Высокий" className="bg-[#11141A] text-white">Высокий</option>
              <option value="Средний" className="bg-[#11141A] text-white">Средний</option>
              <option value="Низкий" className="bg-[#11141A] text-white">Низкий</option>
            </select>
          </div>
        </div>

        {/* Local search input */}
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Фильтр по названию задачи или проекту..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.03] hover:bg-white/[0.06] focus:bg-[#151922] text-white placeholder:text-slate-500 rounded-xl border border-white/[0.06] focus:border-white/[0.2] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="bg-[#11141A] rounded-2xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] text-purple-400 flex items-center justify-center mx-auto mb-3">
              <CheckSquare size={22} />
            </div>
            <div className="text-sm font-bold text-white">Пока здесь ничего нет</div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-normal">
              Создайте задачу с дедлайном и приоритетом или сбросьте параметры фильтрации
            </p>
            <button
              onClick={() => openCreateModal('task')}
              className="mt-4 px-4 py-2 bg-white text-slate-950 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              Добавить задачу
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const priorityConfig = statusColors[task.priority] || {
              bg: 'bg-white/[0.04] text-slate-400 border-white/[0.08]',
            };

            return (
              <div
                key={task.id}
                className={`p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-3 ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Complete toggle checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all min-w-[20px] ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                        : 'border-white/[0.2] hover:border-white/[0.4] bg-white/[0.02]'
                    }`}
                    aria-label="Завершить задачу"
                  >
                    {task.completed && <CheckSquare size={13} />}
                  </button>

                  <div
                    className="min-w-0 cursor-pointer flex-1"
                    onClick={() => openEditModal('task', task)}
                  >
                    <div
                      className={`text-sm font-semibold tracking-tight ${
                        task.completed ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-slate-300 truncate">
                        <FolderKanban size={11} className="text-slate-500" />
                        {task.projectName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400 shrink-0">
                        <Calendar size={11} />
                        {task.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority & Status tag */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${priorityConfig.bg}`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
