import React, { useState, useEffect, useRef } from 'react';
import {
  Trash2,
  Maximize2,
  ExternalLink,
  Edit2,
  Check,
  Palette,
  Copy,
  GripHorizontal,
  Image as ImageIcon,
  Type,
  Link2,
} from 'lucide-react';
import { BoardItem } from '../../types';
import { imageStorage } from '../../services/imageStorage';

interface BoardItemCardProps {
  item: BoardItem;
  zoom: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  onUpdate: (id: string, updates: Partial<BoardItem>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (item: BoardItem) => void;
  onOpenLightbox: (imageUrl: string, title?: string) => void;
  onBringToFront: (id: string) => void;
}

const NOTE_COLORS = [
  { name: 'Графит', bg: 'bg-[#181B22]', border: 'border-white/10', text: 'text-slate-200' },
  { name: 'Янтарь', bg: 'bg-[#261E14]', border: 'border-amber-500/30', text: 'text-amber-100' },
  { name: 'Изумруд', bg: 'bg-[#14261C]', border: 'border-emerald-500/30', text: 'text-emerald-100' },
  { name: 'Лазурь', bg: 'bg-[#14202B]', border: 'border-blue-500/30', text: 'text-blue-100' },
  { name: 'Фиолетовый', bg: 'bg-[#20172B]', border: 'border-purple-500/30', text: 'text-purple-100' },
];

export const BoardItemCard: React.FC<BoardItemCardProps> = ({
  item,
  zoom,
  isSelected,
  onSelect,
  onPositionChange,
  onSizeChange,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpenLightbox,
  onBringToFront,
}) => {
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState<boolean>(item.type === 'image');
  const [isEditingText, setIsEditingText] = useState<boolean>(false);
  const [textContent, setTextContent] = useState<string>(item.content || '');
  const [textTitle, setTextTitle] = useState<string>(item.title || '');
  const [showColorMenu, setShowColorMenu] = useState<boolean>(false);

  // Local drag/resize tracking
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: item.x, y: item.y });
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: item.width,
    height: item.height,
  });

  useEffect(() => {
    setPos({ x: item.x, y: item.y });
  }, [item.x, item.y]);

  useEffect(() => {
    setSize({ width: item.width, height: item.height });
  }, [item.width, item.height]);

  useEffect(() => {
    setTextContent(item.content || '');
    setTextTitle(item.title || '');
  }, [item.content, item.title]);

  // Resolve image URL if type is image
  useEffect(() => {
    if (item.type !== 'image') return;
    let isMounted = true;
    const target = item.imageUrl || item.content;
    if (!target) {
      setImageLoading(false);
      return;
    }

    imageStorage
      .getImageUrl(target)
      .then((url) => {
        if (isMounted) {
          setResolvedImageUrl(url || target);
          setImageLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setResolvedImageUrl(target);
          setImageLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [item.type, item.content, item.imageUrl]);

  // DRAG INTERACTION
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; itemX: number; itemY: number }>({
    startX: 0,
    startY: 0,
    itemX: 0,
    itemY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only left click or primary touch
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.prevent-drag')) return;

    onSelect(item.id);
    onBringToFront(item.id);

    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      itemX: pos.x,
      itemY: pos.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = (moveEvent.clientX - dragStartRef.current.startX) / zoom;
      const dy = (moveEvent.clientY - dragStartRef.current.startY) / zoom;
      setPos({
        x: Math.round(dragStartRef.current.itemX + dx),
        y: Math.round(dragStartRef.current.itemY + dy),
      });
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        const dx = (upEvent.clientX - dragStartRef.current.startX) / zoom;
        const dy = (upEvent.clientY - dragStartRef.current.startY) / zoom;
        const finalX = Math.round(dragStartRef.current.itemX + dx);
        const finalY = Math.round(dragStartRef.current.itemY + dy);
        onPositionChange(item.id, finalX, finalY);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // RESIZE INTERACTION
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef<{ startX: number; startY: number; startW: number; startH: number }>({
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
  });

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(item.id);
    onBringToFront(item.id);

    isResizingRef.current = true;
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
    };

    const handleResizeMove = (moveEvent: PointerEvent) => {
      if (!isResizingRef.current) return;
      const dw = (moveEvent.clientX - resizeStartRef.current.startX) / zoom;
      const dh = (moveEvent.clientY - resizeStartRef.current.startY) / zoom;
      const minW = item.type === 'image' ? 140 : 160;
      const minH = item.type === 'link' ? 70 : 80;
      setSize({
        width: Math.max(minW, Math.round(resizeStartRef.current.startW + dw)),
        height: Math.max(minH, Math.round(resizeStartRef.current.startH + dh)),
      });
    };

    const handleResizeUp = (upEvent: PointerEvent) => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        const dw = (upEvent.clientX - resizeStartRef.current.startX) / zoom;
        const dh = (upEvent.clientY - resizeStartRef.current.startY) / zoom;
        const minW = item.type === 'image' ? 140 : 160;
        const minH = item.type === 'link' ? 70 : 80;
        const finalW = Math.max(minW, Math.round(resizeStartRef.current.startW + dw));
        const finalH = Math.max(minH, Math.round(resizeStartRef.current.startH + dh));
        onSizeChange(item.id, finalW, finalH);
      }
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', handleResizeUp);
    };

    window.addEventListener('pointermove', handleResizeMove);
    window.addEventListener('pointerup', handleResizeUp);
  };

  const handleSaveText = () => {
    setIsEditingText(false);
    onUpdate(item.id, {
      title: textTitle.trim() || undefined,
      content: textContent,
    });
  };

  const activeColorObj =
    NOTE_COLORS.find((c) => c.border.includes(item.color || '')) || NOTE_COLORS[0];

  return (
    <div
      id={`board-item-${item.id}`}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: item.zIndex || 1,
      }}
      onPointerDown={handlePointerDown}
      onClick={() => onSelect(item.id)}
      className={`absolute select-none group transition-shadow duration-150 touch-none ${
        isSelected ? 'ring-2 ring-blue-500/80 shadow-2xl' : 'hover:shadow-xl'
      }`}
    >
      {/* Floating Toolbar on hover / selection */}
      <div
        className={`prevent-drag absolute -top-9 left-0 right-0 h-8 flex items-center justify-between px-2 bg-[#12151C]/95 backdrop-blur-md border border-white/10 rounded-lg text-xs z-30 transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <GripHorizontal size={13} className="text-slate-500 cursor-move" />
          <span className="font-medium text-slate-300">
            {item.type === 'image' && 'Фото'}
            {item.type === 'text' && 'Заметка'}
            {item.type === 'link' && 'Ссылка'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {item.type === 'text' && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorMenu(!showColorMenu);
                }}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
                title="Цвет заметки"
              >
                <Palette size={13} />
              </button>

              {showColorMenu && (
                <div className="absolute right-0 top-full mt-1 p-1.5 bg-[#1A1D24] border border-white/15 rounded-lg shadow-xl flex gap-1 z-40">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate(item.id, { color: c.border.split(' ')[0] });
                        setShowColorMenu(false);
                      }}
                      className={`w-5 h-5 rounded-full ${c.bg} border ${c.border} hover:scale-110 transition-transform`}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {item.type === 'image' && resolvedImageUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenLightbox(resolvedImageUrl, item.title);
              }}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
              title="Развернуть на весь экран"
            >
              <Maximize2 size={13} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(item);
            }}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="Дублировать"
          >
            <Copy size={13} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
            title="Удалить с доски"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ITEM BODY: IMAGE */}
      {item.type === 'image' && (
        <div className="w-full h-full rounded-xl overflow-hidden bg-[#161922] border border-white/10 shadow-lg flex flex-col relative group/img">
          <div className="relative flex-1 w-full h-full overflow-hidden bg-black/40 flex items-center justify-center">
            {imageLoading ? (
              <div className="flex flex-col items-center justify-center text-slate-500 gap-2 p-4">
                <ImageIcon size={24} className="animate-pulse text-slate-400" />
                <span className="text-[11px]">Загрузка...</span>
              </div>
            ) : resolvedImageUrl ? (
              <img
                src={resolvedImageUrl}
                alt={item.title || 'Изображение'}
                className="w-full h-full object-cover select-none pointer-events-none"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 gap-1.5 p-4 text-center">
                <ImageIcon size={22} />
                <span className="text-[11px]">Не удалось загрузить</span>
              </div>
            )}

            {/* Quick lightbox trigger on double click or overlay */}
            {resolvedImageUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox(resolvedImageUrl, item.title);
                }}
                className="prevent-drag absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white/80 hover:text-white rounded-lg backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity"
                title="Полноэкранный просмотр"
              >
                <Maximize2 size={13} />
              </button>
            )}
          </div>

          {/* Optional Caption */}
          {item.title && (
            <div className="px-2.5 py-1.5 bg-[#14171F] border-t border-white/5 text-[11px] text-slate-300 font-medium truncate">
              {item.title}
            </div>
          )}
        </div>
      )}

      {/* ITEM BODY: TEXT NOTE */}
      {item.type === 'text' && (
        <div
          className={`w-full h-full rounded-xl p-3 flex flex-col justify-between shadow-lg border ${activeColorObj.bg} ${activeColorObj.border} ${activeColorObj.text}`}
        >
          {isEditingText ? (
            <div className="prevent-drag flex flex-col h-full gap-2">
              <input
                type="text"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="Заголовок (необязательно)"
                className="w-full px-2 py-1 bg-black/30 border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-white/20"
              />
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Текст заметки или мысли..."
                className="w-full flex-1 px-2 py-1 bg-black/30 border border-white/10 rounded-lg text-xs text-slate-200 resize-none focus:outline-none focus:border-white/20"
                autoFocus
              />
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveText}
                  className="px-2.5 py-1 bg-white text-slate-950 font-medium text-[11px] rounded-md flex items-center gap-1 shadow-xs"
                >
                  <Check size={12} />
                  <span>Готово</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="flex-1 flex flex-col overflow-hidden cursor-text"
              onDoubleClick={() => setIsEditingText(true)}
            >
              {item.title && (
                <div className="font-bold text-xs sm:text-sm tracking-tight mb-1 text-white truncate">
                  {item.title}
                </div>
              )}
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto dark-scrollbar flex-1 opacity-90">
                {item.content || 'Пустая заметка. Дважды кликните, чтобы написать текст...'}
              </div>
              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400/80 border-t border-white/5 mt-2">
                <span>Дважды кликните для правки</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingText(true);
                  }}
                  className="prevent-drag hover:text-white flex items-center gap-0.5"
                >
                  <Edit2 size={10} />
                  <span>Редактировать</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ITEM BODY: LINK */}
      {item.type === 'link' && (
        <div className="w-full h-full rounded-xl bg-[#141824] border border-blue-500/20 hover:border-blue-500/40 p-3 shadow-lg flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Link2 size={13} />
              </div>
              <span className="text-xs font-bold text-white truncate flex-1">
                {item.title || 'Внешняя ссылка'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 break-all">
              {item.linkUrl || item.content}
            </p>
          </div>

          <div className="prevent-drag pt-2 flex items-center justify-between border-t border-white/5 text-[11px]">
            <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
              {(() => {
                try {
                  return new URL(item.linkUrl || item.content).hostname;
                } catch {
                  return 'Ссылка';
                }
              })()}
            </span>
            <a
              href={item.linkUrl || item.content}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium px-2 py-0.5 rounded hover:bg-blue-500/10 transition-colors"
            >
              <span>Открыть</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      )}

      {/* RESIZE HANDLE (Bottom-Right corner) */}
      <div
        onPointerDown={handleResizeStart}
        className="prevent-drag absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-[#12151C] cursor-se-resize shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
        title="Потяните для изменения размера"
      />
    </div>
  );
};
