import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, FolderKanban, ArrowUpRight, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { formatMoney } from '../../utils/formatters';

export const CaseStudyModal: React.FC = () => {
  const { caseStudyProject, closeCaseStudy } = useApp();
  const [copied, setCopied] = useState(false);

  if (!caseStudyProject) return null;

  const caseData = dataService.generateCaseStudy(caseStudyProject.id);
  if (!caseData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(caseData.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={closeCaseStudy}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#11141A] border border-white/[0.1] rounded-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Автоматический кейс проекта
              </h3>
              <p className="text-[11px] text-slate-400">
                Готовая структура для Behance, Telegram-канала или портфолио
              </p>
            </div>
          </div>
          <button
            onClick={closeCaseStudy}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Project Meta Bar */}
        <div className="px-5 py-3 bg-white/[0.02] border-b border-white/[0.04] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">Проект</span>
            <span className="font-semibold text-white truncate block">
              {caseData.project.title}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Клиент</span>
            <span className="font-semibold text-slate-200 truncate block">
              {caseData.client?.name || caseData.project.clientName}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Бюджет</span>
            <span className="font-semibold text-emerald-400 block">
              {formatMoney(caseData.project.cost)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Эффективная ставка</span>
            <span className="font-semibold text-blue-400 block">
              {caseData.effectiveRate}
            </span>
          </div>
        </div>

        {/* Preview Markdown / Text */}
        <div className="p-5 overflow-y-auto dark-scrollbar flex-1 bg-[#0A0C10] font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap select-all">
          {caseData.markdown}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between gap-3 bg-[#11141A]">
          <span className="text-[11px] text-slate-500">
            Формат Markdown готов к копированию и экспорту
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={closeCaseStudy}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Закрыть
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  Скопировано!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Скопировать кейс
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
