import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface BoardLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export const BoardLightboxModal: React.FC<BoardLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
}) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = (title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'board_image') + '.webp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center z-10 select-none">
        {/* Top bar with info & close */}
        <div className="w-full flex items-center justify-between py-2 px-3 text-white mb-2 bg-black/50 backdrop-blur-sm rounded-xl border border-white/10">
          <span className="text-xs sm:text-sm font-medium truncate max-w-[70%]">
            {title || 'Просмотр изображения'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
              title="Скачать"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Скачать</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Закрыть"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Image Frame */}
        <div className="relative overflow-auto max-h-[80vh] flex items-center justify-center rounded-2xl border border-white/10 shadow-2xl bg-black/60 p-2">
          <img
            src={imageUrl}
            alt={title || 'Board Image'}
            className="max-h-[75vh] max-w-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
};
