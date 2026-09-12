import React, { useState, useMemo } from 'react';
import { Lightbulb, Plus, Search, Sparkles, ArrowRight, Tag, Bookmark } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { statusColors } from '../utils/formatters';

export const IdeasPage: React.FC = () => {
  const { ideas, openCreateModal, openEditModal, searchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>('');

  const categories = ['all', 'Reels', 'YouTube', 'Статья', 'Продукт', 'Подкаст'];

  const filteredIdeas = useMemo(() => {
    const q = (searchQuery || localSearch).toLowerCase().trim();
    return ideas.filter((idea) => {
      const matchCat = selectedCategory === 'all' || idea.category === selectedCategory;
      const matchQuery =
        !q ||
        idea.title.toLowerCase().includes(q) ||
        idea.description.toLowerCase().includes(q) ||
        idea.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [ideas, selectedCategory, searchQuery, localSearch]);

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
            Банк креативных гипотез, сценариев и тем для привлечения клиентов
          </p>
        </div>
        <button
          onClick={() => openCreateModal('idea')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all min-h-[40px]"
        >
          <Plus size={16} />
          Записать идею
        </button>
      </div>

      {/* Quote Banner */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
        <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Принцип FREELA
          </div>
          <p className="text-xs font-normal text-slate-300 mt-0.5 leading-relaxed">
            «Большинство планировщиков помогают делать контент. FREELA должна помогать превращать
            деятельность в результат.»
          </p>
        </div>
      </div>

      {/* Filter categories */}
      <div className="bg-[#11141A] p-3 rounded-2xl border border-white/[0.06] space-y-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white/[0.12] text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {cat === 'all' ? 'Все форматы' : cat}
              </button>
            );
          })}
        </div>

        {/* Local search input */}
        <div className="relative w-full">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Поиск по темам, описанию или тегам..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.03] hover:bg-white/[0.06] focus:bg-[#151922] text-white placeholder:text-slate-500 rounded-xl border border-white/[0.06] focus:border-white/[0.2] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIdeas.map((idea) => {
          const statusConfig = statusColors[idea.status] || {
            bg: 'bg-white/[0.04]',
            text: 'text-slate-400',
            dot: 'bg-slate-500',
          };

          return (
            <div
              key={idea.id}
              onClick={() => openEditModal('idea', idea)}
              className="bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.14] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1.5 ${statusConfig.bg}`}
                  >
                    <span className={`w-1 h-1 rounded-full ${statusConfig.dot}`}></span>
                    {idea.status}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white/[0.04] text-slate-400 border border-white/[0.06] rounded-md">
                    {idea.category}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
                  {idea.title}
                </h3>

                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed font-normal">
                  {idea.description}
                </p>

                {/* Tags */}
                {idea.tags && idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {idea.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium text-slate-500 bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Action: convert to content */}
              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-normal">
                  {idea.createdAt}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreateModal('content');
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1 rounded-xl transition-colors"
                >
                  <span>В контент</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
