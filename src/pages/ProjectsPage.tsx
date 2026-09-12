import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, FolderKanban, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney, statusColors } from '../utils/formatters';

export const ProjectsPage: React.FC = () => {
  const { projects, tasks, openCreateModal, openEditModal, openCaseStudy, searchQuery } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>('');

  const statuses: { label: string; value: string }[] = [
    { label: 'Все проекты', value: 'all' },
    { label: 'В работе', value: 'В работе' },
    { label: 'На согласовании', value: 'На согласовании' },
    { label: 'Пауза', value: 'Пауза' },
    { label: 'Завершен', value: 'Завершен' },
  ];

  const filteredProjects = useMemo(() => {
    const q = (searchQuery || localSearch).toLowerCase().trim();
    return projects.filter((p) => {
      const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [projects, selectedStatus, searchQuery, localSearch]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban size={22} className="text-blue-400" />
            Проекты
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-normal">
            Управление коммерческими заказами, этапами, ставкой и дедлайнами
          </p>
        </div>
        <button
          onClick={() => openCreateModal('project')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all min-h-[40px]"
        >
          <Plus size={16} />
          Новый проект
        </button>
      </div>

      {/* Filter bar & local search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#11141A] p-2.5 rounded-2xl border border-white/[0.06]">
        {/* Status filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statuses.map((s) => {
            const isActive = selectedStatus === s.value;
            const count =
              s.value === 'all'
                ? projects.length
                : projects.filter((p) => p.status === s.value).length;
            return (
              <button
                key={s.value}
                onClick={() => setSelectedStatus(s.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all min-h-[34px] flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white/[0.12] text-white font-semibold'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <span>{s.label}</span>
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

        {/* Local search input */}
        <div className="relative min-w-[200px]">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Фильтр проектов..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.03] hover:bg-white/[0.06] focus:bg-[#151922] text-white placeholder:text-slate-500 rounded-xl border border-white/[0.06] focus:border-white/[0.2] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-[#11141A] rounded-2xl p-12 text-center border border-white/[0.06]">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] text-blue-400 flex items-center justify-center mx-auto mb-3">
            <FolderKanban size={22} />
          </div>
          <h3 className="text-sm font-bold text-white">Пока здесь ничего нет</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-normal">
            Создайте первый коммерческий проект, чтобы отслеживать дедлайны, этапы и доходы
          </p>
          <button
            onClick={() => openCreateModal('project')}
            className="mt-4 px-4 py-2 bg-white text-slate-950 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            Создать первый проект
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => {
            const statusConfig = statusColors[proj.status] || {
              bg: 'bg-white/[0.04]',
              text: 'text-slate-400',
              dot: 'bg-slate-500',
            };
            const projectTasks = tasks.filter((t) => t.projectId === proj.id);
            const completedTasks = projectTasks.filter((t) => t.completed).length;

            const hourlyRate =
              proj.hoursSpent && proj.hoursSpent > 0
                ? Math.round(proj.cost / proj.hoursSpent)
                : null;

            return (
              <div
                key={proj.id}
                onClick={() => openEditModal('project', proj)}
                className="bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.14] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1.5 ${statusConfig.bg}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${statusConfig.dot}`}></span>
                      {proj.status}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {formatMoney(proj.cost)}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 font-normal">
                    Клиент: <span className="text-slate-200">{proj.clientName}</span>
                  </p>

                  {proj.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-normal">
                      {proj.description}
                    </p>
                  )}

                  {/* Hourly Rate calculation pill (Пункт 12) */}
                  {hourlyRate && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[10px] text-slate-400">
                      <Clock size={11} className="text-slate-500" />
                      <span>{proj.hoursSpent} ч потрачено</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        {hourlyRate.toLocaleString('ru-RU')} ₽ / ч
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/[0.04] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Calendar size={11} className="text-slate-500" />
                      {proj.deadline}
                    </span>
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      {completedTasks}/{projectTasks.length} задач
                    </span>
                  </div>

                  {/* Progress Bar & Case Button */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-emerald-400"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-300 shrink-0">
                        {proj.progress}%
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCaseStudy(proj);
                      }}
                      className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-[10px] font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Sparkles size={11} />
                      Кейс
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
