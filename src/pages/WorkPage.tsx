import React from 'react';
import { FolderKanban, Users, CheckSquare, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WorkSubTab } from '../types';
import { ProjectsPage } from './ProjectsPage';
import { ClientsPage } from './ClientsPage';
import { TasksPage } from './TasksPage';

export const WorkPage: React.FC = () => {
  const { workTab, setWorkTab, projects, clients, tasks, kpi } = useApp();

  const tabs: { id: WorkSubTab; label: string; count: number; icon: React.ReactNode }[] = [
    {
      id: 'projects',
      label: 'Проекты',
      count: projects.length,
      icon: <FolderKanban size={15} className="text-blue-400" />,
    },
    {
      id: 'clients',
      label: 'Клиенты',
      count: clients.length,
      icon: <Users size={15} className="text-emerald-400" />,
    },
    {
      id: 'tasks',
      label: 'Задачи',
      count: tasks.filter((t) => !t.completed).length,
      icon: <CheckSquare size={15} className="text-purple-400" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs bar: Проекты | Клиенты | Задачи */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#11141A] rounded-2xl border border-white/[0.06] w-fit max-w-full overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = workTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setWorkTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] ${
                isActive
                  ? 'bg-white/[0.1] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/[0.05] text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Render active sub-view */}
      <div>
        {workTab === 'projects' && <ProjectsPage />}
        {workTab === 'clients' && <ClientsPage />}
        {workTab === 'tasks' && <TasksPage />}
      </div>
    </div>
  );
};
