import React, { useState, useMemo } from 'react';
import { Plus, Search, Users, Mail, Phone, Send, Briefcase, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/formatters';

export const ClientsPage: React.FC = () => {
  const { clients, projects, openCreateModal, openEditModal, searchQuery } = useApp();
  const [localSearch, setLocalSearch] = useState<string>('');

  const filteredClients = useMemo(() => {
    const q = (searchQuery || localSearch).toLowerCase().trim();
    return clients.filter((c) => {
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.telegram?.toLowerCase().includes(q)
      );
    });
  }, [clients, searchQuery, localSearch]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users size={22} className="text-purple-400" />
            Клиенты
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-normal">
            База заказчиков, контактные лица и история взаиморасчетов
          </p>
        </div>
        <button
          onClick={() => openCreateModal('client')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all min-h-[40px]"
        >
          <Plus size={16} />
          Новый клиент
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-[#11141A] p-2.5 rounded-2xl border border-white/[0.06] flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Поиск по имени, компании или Telegram..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/[0.03] hover:bg-white/[0.06] focus:bg-[#151922] text-white placeholder:text-slate-500 rounded-xl border border-white/[0.06] focus:border-white/[0.2] focus:outline-none transition-all"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium px-2 shrink-0">
          Всего: <span className="font-semibold text-white">{clients.length}</span>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredClients.map((client) => {
          const clientProjects = projects.filter((p) => p.clientId === client.id);
          const totalClientRevenue = clientProjects.reduce((acc, p) => acc + p.cost, 0);

          return (
            <div
              key={client.id}
              onClick={() => openEditModal('client', client)}
              className="bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.14] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {client.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-white leading-tight group-hover:text-purple-300 transition-colors">
                        {client.name}
                      </h3>
                      {client.company && (
                        <p className="text-xs text-slate-400 mt-0.5">{client.company}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 font-medium block">Общий объем</span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {formatMoney(totalClientRevenue)}
                    </span>
                  </div>
                </div>

                {/* Contacts list */}
                <div className="space-y-1.5 mt-4 text-xs">
                  {client.telegram && (
                    <div className="flex items-center gap-2 text-blue-400 font-medium text-[11px]">
                      <Send size={12} />
                      <span>{client.telegram}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Mail size={12} />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Phone size={12} />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <p className="text-xs text-slate-400 mt-3 p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl leading-relaxed font-normal">
                    {client.notes}
                  </p>
                )}
              </div>

              {/* Connected projects preview */}
              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Briefcase size={12} className="text-slate-500" />
                  <span>
                    {clientProjects.length === 0
                      ? 'Нет активных проектов'
                      : `${clientProjects.length} ${
                          clientProjects.length === 1 ? 'проект' : 'проекта'
                        }`}
                  </span>
                </div>
                <span className="text-xs font-medium text-purple-400 flex items-center gap-1 group-hover:underline">
                  Карточка
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
