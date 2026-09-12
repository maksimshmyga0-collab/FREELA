import React, { useState, useMemo, useRef } from 'react';
import { Lightbulb, Plus, Search, Trash2, Edit3, ArrowRight, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Idea } from '../types';

export const IdeasPage: React.FC = () => {
  const { ideas, openCreateModal, openEditModal, deleteItem, saveItem, searchQuery, openCreateModal: createContentModal } = useApp();
  const [localSearch, setLocalSearch] = useState<string>('');
  
  // Quick note state (Google Keep style)
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [quickTitle, setQuickTitle] = useState<string>('');
  const [quickDescription, setQuickDescription] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const filteredIdeas = useMemo(() => {
    const q = (searchQuery || localSearch).toLowerCase().trim();
    if (!q) return ideas;
    return ideas.filter((idea) => {
      return (
        idea.title.toLowerCase().includes(q) ||
        (idea.description && idea.description.toLowerCase().includes(q))
      );
    });
  }, [ideas, searchQuery, localSearch]);

  const handleSaveQuickNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickTitle.trim() && !quickDescription.trim()) {
      setIsExpanded(false);
      return;
    }

    const titleToSave = quickTitle.trim() || quickDescription.trim().slice(0, 40) + '...';
    saveItem('idea', {
      title: titleToSave,
      description: quickDescription.trim(),
    });

    setQuickTitle('');
    setQuickDescription('');
    setIsExpanded(false);
  };

  const handleCancelQuickNote = () => {
    setQuickTitle('');
    setQuickDescription('');
    setIsExpanded(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem('idea', id);
    setDeletingId(null);
  };

  const handleConvertToContent = (idea: Idea, e: React.MouseEvent) => {
    e.stopPropagation();
    // Opens content modal, giving seamless bridge from Idea to Content
    createContentModal('content');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Lightbulb size={22} className="text-amber-400" />
            Идеи
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-normal">
            Личные заметки и мысли. Пришла идея — быстро записал и сохранил.
          </p>
        </div>
        <button
          onClick={() => openCreateModal('idea')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all min-h-[40px]"
        >
          <Plus size={16} />
          Новая заметка
        </button>
      </div>

      {/* Quick Note Input Box (Google Keep style) */}
      <div
        ref={containerRef}
        className={`bg-[#11141A] rounded-2xl border transition-all duration-200 ${
          isExpanded
            ? 'border-white/[0.18] shadow-lg shadow-black/40 p-4 sm:p-5'
            : 'border-white/[0.08] hover:border-white/[0.14] p-3 sm:p-3.5 cursor-text'
        }`}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
      >
        {!isExpanded ? (
          <div className="flex items-center justify-between gap-3 text-slate-400">
            <span className="text-xs sm:text-sm text-slate-400 font-normal">
              Заметка... Быстро записать мысль или идею
            </span>
            <div className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-colors">
              <Plus size={15} />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveQuickNote} className="space-y-3">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Заголовок заметки (необязательно)"
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-white placeholder:text-slate-500 focus:outline-none"
              autoFocus
            />
            <textarea
              rows={3}
              value={quickDescription}
              onChange={(e) => setQuickDescription(e.target.value)}
              placeholder="Текст заметки / мысли... (Ctrl + Enter для быстрого сохранения)"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  handleSaveQuickNote();
                }
              }}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
            />
            <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
              <span className="text-[11px] text-slate-500">
                Личная заметка • Без лишних полей
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelQuickNote}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Check size={14} />
                  Сохранить
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Filter / Search bar */}
      <div className="bg-[#11141A] p-3 rounded-2xl border border-white/[0.06]">
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Поиск по заметкам и мыслям..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.03] hover:bg-white/[0.06] focus:bg-[#151922] text-white placeholder:text-slate-500 rounded-xl border border-white/[0.06] focus:border-white/[0.2] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Notes Grid (Google Keep style cards) */}
      {filteredIdeas.length === 0 ? (
        <div className="bg-[#11141A] rounded-2xl p-12 text-center border border-white/[0.06]">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Lightbulb size={22} />
          </div>
          <h3 className="text-sm font-bold text-white">Пока нет заметок</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-normal">
            Запишите первую мысль в поле выше или нажмите кнопку «Новая заметка».
          </p>
          <button
            onClick={() => openCreateModal('idea')}
            className="mt-4 px-4 py-2 bg-white text-slate-950 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            Записать мысль
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {filteredIdeas.map((idea) => {
            const isConfirmingDelete = deletingId === idea.id;

            return (
              <div
                key={idea.id}
                onClick={() => openEditModal('idea', idea)}
                className="bg-[#11141A] p-4 sm:p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.16] transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-amber-400 transition-colors break-words leading-snug">
                    {idea.title}
                  </h3>

                  {idea.description && (
                    <p className="text-xs text-slate-300 mt-2.5 whitespace-pre-wrap leading-relaxed break-words font-normal">
                      {idea.description}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {idea.createdAt || 'Недавно'}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Convert to content action */}
                    <button
                      type="button"
                      onClick={(e) => handleConvertToContent(idea, e)}
                      title="Превратить в контент"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <ArrowRight size={13} />
                      <span className="hidden sm:inline">В контент</span>
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal('idea', idea);
                      }}
                      title="Редактировать"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Edit3 size={13} />
                    </button>

                    {/* Delete button / Confirm delete */}
                    {isConfirmingDelete ? (
                      <div
                        className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleDelete(idea.id, e)}
                          title="Подтвердить удаление"
                          className="p-1 text-rose-400 hover:text-rose-300"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(null);
                          }}
                          title="Отмена"
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(idea.id);
                        }}
                        title="Удалить заметку"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
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
