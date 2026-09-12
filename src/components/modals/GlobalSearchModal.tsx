import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  FolderKanban,
  Users,
  CheckSquare,
  Wallet,
  Lightbulb,
  FileText,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { formatMoney } from '../../utils/formatters';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch, openEditModal, setActiveSection } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return null;
    return dataService.search(query);
  }, [query]);

  const totalResultsCount = useMemo(() => {
    if (!results) return 0;
    return (
      results.projects.length +
      results.clients.length +
      results.tasks.length +
      results.finance.length +
      results.ideas.length +
      results.content.length +
      results.results.length
    );
  }, [results]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={closeSearch}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#11141A] border border-white/[0.1] rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center gap-3">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по проектам, клиентам, задачам, финансам, идеям..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/[0.08] rounded-md shrink-0">
            ESC
          </kbd>
        </div>

        {/* Search Results Area */}
        <div className="p-4 max-h-[65vh] overflow-y-auto dark-scrollbar space-y-5">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Начните вводить текст для поиска по всем 8 разделам FREELA
            </div>
          ) : totalResultsCount === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              По запросу «{query}» ничего не найдено
            </div>
          ) : (
            <>
              {/* Projects */}
              {results && results.projects.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FolderKanban size={13} className="text-blue-400" />
                      Проекты
                    </span>
                    <span className="text-[10px] bg-white/[0.04] px-1.5 py-0.5 rounded text-slate-400">
                      {results.projects.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.projects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          closeSearch();
                          openEditModal('project', p);
                        }}
                        className="p-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl border border-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{p.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {p.clientName} • {formatMoney(p.cost)}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full shrink-0">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clients */}
              {results && results.clients.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users size={13} className="text-emerald-400" />
                      Клиенты
                    </span>
                    <span className="text-[10px] bg-white/[0.04] px-1.5 py-0.5 rounded text-slate-400">
                      {results.clients.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.clients.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          closeSearch();
                          openEditModal('client', c);
                        }}
                        className="p-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl border border-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{c.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {c.company || 'Частный клиент'} • {c.telegram || c.email}
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {results && results.tasks.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare size={13} className="text-purple-400" />
                      Задачи
                    </span>
                    <span className="text-[10px] bg-white/[0.04] px-1.5 py-0.5 rounded text-slate-400">
                      {results.tasks.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.tasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          closeSearch();
                          openEditModal('task', t);
                        }}
                        className="p-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl border border-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <div
                            className={`text-xs font-medium truncate ${
                              t.completed ? 'line-through text-slate-500' : 'text-white'
                            }`}
                          >
                            {t.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {t.projectName} • Дедлайн: {t.deadline}
                          </div>
                        </div>
                        <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full shrink-0">
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Finance */}
              {results && results.finance.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Wallet size={13} className="text-amber-400" />
                      Финансы
                    </span>
                    <span className="text-[10px] bg-white/[0.04] px-1.5 py-0.5 rounded text-slate-400">
                      {results.finance.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.finance.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => {
                          closeSearch();
                          openEditModal('finance', f);
                        }}
                        className="p-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl border border-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white truncate">{f.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {f.category} • {f.date}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className={`text-xs font-bold ${
                              f.type === 'income' ? 'text-emerald-400' : 'text-slate-300'
                            }`}
                          >
                            {f.type === 'income' ? '+' : '-'}
                            {formatMoney(f.amount)}
                          </div>
                          <span className="text-[10px] text-slate-400">{f.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ideas */}
              {results && results.ideas.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lightbulb size={13} className="text-amber-400" />
                      Идеи
                    </span>
                    <span className="text-[10px] bg-white/[0.04] px-1.5 py-0.5 rounded text-slate-400">
                      {results.ideas.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.ideas.map((i) => (
                      <div
                        key={i.id}
                        onClick={() => {
                          closeSearch();
                          openEditModal('idea', i);
                        }}
                        className="p-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl border border-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{i.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">{i.description}</div>
                        </div>
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                          {i.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content & Results */}
              {results && (results.content.length > 0 || results.results.length > 0) && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText size={13} className="text-indigo-400" />
                      Контент и Результаты
                    </span>
                    <span className="text-[10px] bg-white/[0.04] px-1.5 py-0.5 rounded text-slate-400">
                      {results.content.length + results.results.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.content.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          closeSearch();
                          openEditModal('content', c);
                        }}
                        className="p-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl border border-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white truncate">{c.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {c.platform} • {c.type}
                          </div>
                        </div>
                        <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full shrink-0">
                          {c.status}
                        </span>
                      </div>
                    ))}
                    {results.results.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          closeSearch();
                          openEditModal('result', r);
                        }}
                        className="p-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl border border-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white truncate">{r.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {r.metricValue || ''} {r.change || ''}
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                          Результат
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
          <span>FREELA Global Search</span>
          <button
            onClick={closeSearch}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
