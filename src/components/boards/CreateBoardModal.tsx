import React, { useState, useEffect } from 'react';
import { X, Sparkles, FolderPlus } from 'lucide-react';
import { Board } from '../../types';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; color?: string; icon?: string }) => void;
  initialBoard?: Board | null;
}

const PRESET_COLORS = [
  { label: 'Синий', value: '#3B82F6' },
  { label: 'Фиолетовый', value: '#8B5CF6' },
  { label: 'Изумрудный', value: '#10B981' },
  { label: 'Янтарный', value: '#F59E0B' },
  { label: 'Розовый', value: '#EC4899' },
  { label: 'Графит', value: '#64748B' },
];

const PRESET_ICONS = ['🎨', '💡', '📌', '🚀', '✨', '📸', '📂', '🎯'];

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialBoard,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0].value);
  const [icon, setIcon] = useState(PRESET_ICONS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialBoard) {
      setTitle(initialBoard.title);
      setDescription(initialBoard.description || '');
      setColor(initialBoard.color || PRESET_COLORS[0].value);
      setIcon(initialBoard.icon || PRESET_ICONS[0]);
    } else {
      setTitle('');
      setDescription('');
      setColor(PRESET_COLORS[0].value);
      setIcon(PRESET_ICONS[0]);
    }
    setError('');
  }, [initialBoard, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Пожалуйста, введите название доски');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      color,
      icon,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#12151C] border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-inner"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {icon}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {initialBoard ? 'Редактировать доску' : 'Новая доска'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Визуальное пространство для идей и референсов
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Название доски <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Референсы айдентики, Мудборд сайта..."
              className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/25 transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Описание <span className="text-slate-500 text-[10px]">(необязательно)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Для чего предназначена эта доска..."
              className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/25 transition-colors resize-none"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Иконка
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_ICONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                    icon === emoji
                      ? 'bg-white/15 ring-2 ring-white/30 scale-105'
                      : 'bg-white/[0.03] hover:bg-white/[0.08]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Цветовой акцент
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c.value
                      ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#12151C]'
                      : 'hover:scale-110 opacity-75 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FolderPlus size={14} />
              <span>{initialBoard ? 'Сохранить' : 'Создать доску'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
