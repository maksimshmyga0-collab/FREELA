import React from 'react';
import { Lightbulb, FileText, TrendingUp, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CreatorSubTab } from '../types';
import { IdeasPage } from './IdeasPage';
import { ContentPage } from './ContentPage';
import { ResultsPage } from './ResultsPage';

export const CreatorPage: React.FC = () => {
  const { creatorTab, setCreatorTab, ideas, content, results } = useApp();

  const tabs: { id: CreatorSubTab; label: string; count: number; icon: React.ReactNode }[] = [
    {
      id: 'ideas',
      label: 'Идеи',
      count: ideas.length,
      icon: <Lightbulb size={15} className="text-amber-400" />,
    },
    {
      id: 'content',
      label: 'Контент',
      count: content.length,
      icon: <FileText size={15} className="text-indigo-400" />,
    },
    {
      id: 'results',
      label: 'Результаты',
      count: results.length,
      icon: <TrendingUp size={15} className="text-emerald-400" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs bar: Идеи | Контент | Результаты */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#11141A] rounded-2xl border border-white/[0.06] w-fit max-w-full overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = creatorTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCreatorTab(tab.id)}
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
        {creatorTab === 'ideas' && <IdeasPage />}
        {creatorTab === 'content' && <ContentPage />}
        {creatorTab === 'results' && <ResultsPage />}
      </div>
    </div>
  );
};
