import React, { useState } from 'react';
import { X, Link2, ExternalLink } from 'lucide-react';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, title?: string) => void;
}

export const AddLinkModal: React.FC<AddLinkModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cleaned = url.trim();
    if (!cleaned) {
      setError('Введите ссылку');
      return;
    }

    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'https://' + cleaned;
    }

    // Attempt to extract domain as default title if not provided
    let fallbackTitle = title.trim();
    if (!fallbackTitle) {
      try {
        const u = new URL(cleaned);
        fallbackTitle = u.hostname.replace(/^www\./, '');
      } catch {
        fallbackTitle = cleaned;
      }
    }

    onSubmit(cleaned, fallbackTitle);
    setUrl('');
    setTitle('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm bg-[#12151C] border border-white/[0.08] rounded-2xl p-5 shadow-2xl z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs">
              <Link2 size={15} />
            </div>
            <h2 className="text-sm font-bold text-white">Добавить ссылку</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06]"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3.5">
          {error && (
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              URL адрес <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/inspiration"
              className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Название или подпись <span className="text-slate-500 text-[10px]">(необязательно)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Референс цветовой схемы"
              className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05]"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <ExternalLink size={13} />
              <span>Добавить на доску</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
