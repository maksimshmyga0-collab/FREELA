import React, { useState } from 'react';
import { X, RefreshCw, Download, Upload, Database, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, closeSettings, resetDemoData } = useApp();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isSettingsOpen) return null;

  const handleReset = () => {
    if (window.confirm('Сбросить все данные к исходным демонстрационным? Все несохраненные изменения будут заменены.')) {
      resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  const handleExport = () => {
    const dataStr = dataService.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `freela_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = dataService.importData(content);
      if (success) {
        setImportStatus('success');
      } else {
        setImportStatus('error');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={closeSettings}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#11141A] border border-white/[0.1] rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Настройки FREELA
            </h3>
            <p className="text-[11px] text-slate-400">
              Управление данными, локальным хранилищем и резервными копиями
            </p>
          </div>
          <button
            onClick={closeSettings}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Project Source Code ZIP Download */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Download size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Исходный код проекта (ZIP)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    React + Vite
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Полный архив для VS Code, GitHub и деплоя на Vercel. Включает package.json, TypeScript, все страницы, стили и демо-данные.
                </p>
              </div>
            </div>
            <a
              href="/freela-project.zip"
              download="freela-project.zip"
              className="flex items-center justify-center gap-2 px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0 active:scale-95"
            >
              <Download size={14} />
              <span>Скачать ZIP</span>
            </a>
          </div>

          {/* Storage Information */}
          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Database size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                Локальное хранилище (Offline-First)
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Все твои данные сохраняются локально в защищенном хранилище браузера и мгновенно доступны при обновлении страницы. Архитектура готова к синхронизации с облаком.
              </p>
            </div>
          </div>

          {/* Export / Import Section */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-slate-300">
              Резервное копирование и перенос данных
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl text-left transition-colors flex items-center gap-2.5"
              >
                <Download size={15} className="text-emerald-400" />
                <div>
                  <div className="text-xs font-medium text-white">Экспорт JSON</div>
                  <div className="text-[10px] text-slate-500">Скачать бэкап</div>
                </div>
              </button>

              <label className="p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl text-left transition-colors flex items-center gap-2.5 cursor-pointer">
                <Upload size={15} className="text-blue-400" />
                <div>
                  <div className="text-xs font-medium text-white">Импорт JSON</div>
                  <div className="text-[10px] text-slate-500">Восстановить</div>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus === 'success' && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center gap-2">
                <Check size={14} />
                Данные успешно импортированы!
              </div>
            )}
            {importStatus === 'error' && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle size={14} />
                Ошибка при чтении JSON-файла.
              </div>
            )}
          </div>

          {/* Reset Demo Data */}
          <div className="space-y-2 pt-3 border-t border-white/[0.06]">
            <div className="text-xs font-semibold text-slate-300">
              Сброс состояния
            </div>
            <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div>
                <div className="text-xs font-medium text-white">
                  Сбросить к демо-данным
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Восстанавливает начальный набор проектов, клиентов и задач
                </div>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium rounded-xl transition-colors shrink-0"
              >
                <RefreshCw size={13} />
                Сбросить
              </button>
            </div>

            {resetSuccess && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center gap-2">
                <Check size={14} />
                Демо-данные успешно восстановлены!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
          <span className="text-[10px] text-slate-500">
            FREELA v2.0 • «Работай. Создавай. Развивайся.»
          </span>
          <button
            onClick={closeSettings}
            className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
