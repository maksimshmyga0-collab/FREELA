import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Type,
  Link2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  Edit3,
  Move,
  Upload,
  Check,
  MoreHorizontal,
} from 'lucide-react';
import { Board, BoardItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { imageStorage } from '../../services/imageStorage';
import { BoardItemCard } from './BoardItemCard';
import { BoardLightboxModal } from './BoardLightboxModal';
import { AddLinkModal } from './AddLinkModal';
import { CreateBoardModal } from './CreateBoardModal';

interface BoardCanvasProps {
  board: Board;
  onBack: () => void;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({ board, onBack }) => {
  const { currentUser } = useAuth();
  const {
    boardItems,
    createBoardItem,
    updateBoardItem,
    deleteBoardItem,
    deleteBoard,
    updateBoard,
  } = useApp();

  // Canvas Viewport Transformation
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Modals & Popups
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [isEditBoardModalOpen, setIsEditBoardModalOpen] = useState<boolean>(false);
  const [lightboxState, setLightboxState] = useState<{ isOpen: boolean; url: string; title?: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  // Drag & drop file over canvas indicator
  const [isDraggingFileOver, setIsDraggingFileOver] = useState<boolean>(false);

  // Hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  // Filter items strictly for this board and user
  const currentBoardItems = boardItems.filter((item) => item.boardId === board.id);

  // Auto-center canvas on load if items exist
  useEffect(() => {
    if (currentBoardItems.length > 0) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      currentBoardItems.forEach((i) => {
        minX = Math.min(minX, i.x);
        minY = Math.min(minY, i.y);
        maxX = Math.max(maxX, i.x + i.width);
        maxY = Math.max(maxY, i.y + i.height);
      });

      if (canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        const contentWidth = maxX - minX || 400;
        const contentHeight = maxY - minY || 400;
        const centerX = minX + contentWidth / 2;
        const centerY = minY + contentHeight / 2;

        setPan({
          x: Math.round(rect.width / 2 - centerX),
          y: Math.round(rect.height / 2 - centerY),
        });
      }
    } else {
      setPan({ x: 100, y: 100 });
    }
  }, [board.id]);

  // Center coordinate in canvas space
  const getCanvasCenter = useCallback(() => {
    if (!canvasContainerRef.current) return { x: 200, y: 150 };
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = (rect.width / 2 - pan.x) / zoom - 120;
    const y = (rect.height / 2 - pan.y) / zoom - 80;
    return { x: Math.round(x), y: Math.round(y) };
  }, [pan, zoom]);

  // ZOOM CONTROLS
  const handleZoomIn = () => setZoom((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.3, +(prev - 0.15).toFixed(2)));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 60, y: 60 });
  };

  // PANNING LOGIC
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only pan if clicked on canvas background (not inside item)
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains('canvas-bg-target')) {
      return;
    }
    // Left click or middle click
    if (e.button !== 0 && e.button !== 1) return;

    setSelectedItemId(null);
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - panStartRef.current.x;
      const dy = moveEvent.clientY - panStartRef.current.y;
      setPan({
        x: Math.round(panStartRef.current.panX + dx),
        y: Math.round(panStartRef.current.panY + dy),
      });
    };

    const handlePointerUp = () => {
      setIsPanning(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // MOUSE WHEEL ZOOM & PAN
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => {
        const next = Math.max(0.3, Math.min(2.5, +(prev * zoomFactor).toFixed(2)));
        return next;
      });
    } else {
      // Normal wheel pans canvas
      setPan((prev) => ({
        x: Math.round(prev.x - e.deltaX),
        y: Math.round(prev.y - e.deltaY),
      }));
    }
  };

  // ITEM ACTIONS
  const handleAddTextNote = () => {
    const center = getCanvasCenter();
    createBoardItem({
      boardId: board.id,
      type: 'text',
      content: 'Новая мысль или тезис',
      title: 'Заметка',
      x: center.x + Math.floor(Math.random() * 40 - 20),
      y: center.y + Math.floor(Math.random() * 40 - 20),
      width: 260,
      height: 180,
      zIndex: Date.now() % 10000,
    });
  };

  const handleAddLink = (url: string, title?: string) => {
    const center = getCanvasCenter();
    createBoardItem({
      boardId: board.id,
      type: 'link',
      content: url,
      linkUrl: url,
      title: title || 'Ссылка',
      x: center.x + Math.floor(Math.random() * 40 - 20),
      y: center.y + Math.floor(Math.random() * 40 - 20),
      width: 280,
      height: 130,
      zIndex: Date.now() % 10000,
    });
  };

  const handleProcessImageFile = async (file: File, dropCoords?: { x: number; y: number }) => {
    if (!currentUser?.uid) return;
    try {
      const imageId = await imageStorage.saveImage(file, currentUser.uid);
      const coords = dropCoords || getCanvasCenter();
      createBoardItem({
        boardId: board.id,
        type: 'image',
        content: imageId,
        imageUrl: imageId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        x: coords.x,
        y: coords.y,
        width: 320,
        height: 240,
        zIndex: Date.now() % 10000,
      });
    } catch (err) {
      console.error('Failed to save image:', err);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        await handleProcessImageFile(file);
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // CLIPBOARD PASTE (Images or Text)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            await handleProcessImageFile(file);
            return;
          }
        }
      }

      // Check if text is URL
      const text = e.clipboardData?.getData('text');
      if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
        e.preventDefault();
        handleAddLink(text);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [board.id, currentUser?.uid]);

  // DRAG & DROP FROM OS DESKTOP
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFileOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!canvasContainerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDraggingFileOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFileOver(false);

    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const dropX = Math.round((e.clientX - rect.left - pan.x) / zoom);
    const dropY = Math.round((e.clientY - rect.top - pan.y) / zoom);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          await handleProcessImageFile(file, { x: dropX + i * 30, y: dropY + i * 30 });
        }
      }
    }
  };

  const handleDuplicate = (item: BoardItem) => {
    createBoardItem({
      boardId: board.id,
      type: item.type,
      content: item.content,
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl,
      title: item.title ? `${item.title} (Копия)` : undefined,
      color: item.color,
      x: item.x + 30,
      y: item.y + 30,
      width: item.width,
      height: item.height,
      zIndex: Date.now() % 10000,
    });
  };

  const handleBringToFront = (id: string) => {
    const highestZ = currentBoardItems.reduce((acc, cur) => Math.max(acc, cur.zIndex || 1), 1);
    updateBoardItem(id, { zIndex: highestZ + 1 });
  };

  const handleDeleteBoardConfirm = () => {
    deleteBoard(board.id);
    onBack();
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col bg-[#0B0D13] overflow-hidden select-none">
      {/* Hidden File Input for images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* TOP HEADER / TOOLBAR */}
      <div className="h-14 border-b border-white/[0.08] bg-[#0E1118]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 z-30 shrink-0">
        {/* Left: Back button & Board Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors shrink-0"
            title="Назад к списку досок"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Доски</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 shrink-0" />

          {/* Board Title & Tag */}
          <div
            onClick={() => setIsEditBoardModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer group min-w-0 py-1 px-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
            title="Нажмите для редактирования названия"
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: board.color || '#3B82F6' }}
            />
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {board.title}
            </h1>
            <span className="text-[10px] bg-white/[0.06] text-slate-400 px-2 py-0.5 rounded-full shrink-0 font-medium">
              {currentBoardItems.length}{' '}
              {currentBoardItems.length === 1
                ? 'элемент'
                : currentBoardItems.length > 1 && currentBoardItems.length < 5
                ? 'элемента'
                : 'элементов'}
            </span>
            <Edit3
              size={13}
              className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            />
          </div>
        </div>

        {/* Center/Right: Primary Action Buttons (+ Фото, + Заметка, + Ссылка) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.08] rounded-xl text-xs font-medium transition-colors shadow-xs"
            title="Загрузить изображение (или перетащите прямо на холст)"
          >
            <ImageIcon size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">Изображение</span>
          </button>

          <button
            onClick={handleAddTextNote}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.08] rounded-xl text-xs font-medium transition-colors shadow-xs"
            title="Добавить заметку"
          >
            <Type size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Заметка</span>
          </button>

          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.08] rounded-xl text-xs font-medium transition-colors shadow-xs"
            title="Добавить ссылку"
          >
            <Link2 size={14} className="text-blue-400" />
            <span className="hidden sm:inline">Ссылка</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1 hidden md:block" />

          {/* Delete Board */}
          <button
            onClick={handleDeleteBoardConfirm}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            title="Удалить доску"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* CANVAS WORKSPACE AREA */}
      <div
        ref={canvasContainerRef}
        onPointerDown={handleCanvasPointerDown}
        onWheel={handleWheel}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex-1 w-full h-full overflow-hidden cursor-default canvas-bg-target touch-none ${
          isPanning ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        style={{
          backgroundColor: '#0B0D13',
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)`,
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* Dropping file overlay indicator */}
        {isDraggingFileOver && (
          <div className="absolute inset-0 z-40 pointer-events-none bg-blue-500/10 border-2 border-dashed border-blue-400/60 rounded-2xl flex flex-col items-center justify-center backdrop-blur-xs">
            <div className="p-4 bg-[#12151C] border border-blue-400/30 rounded-2xl shadow-2xl flex items-center gap-3 text-white">
              <Upload size={24} className="text-blue-400 animate-bounce" />
              <div>
                <p className="text-sm font-bold">Отпустите файлы сюда</p>
                <p className="text-xs text-slate-400">Они сразу добавятся на текущую доску</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty Canvas Placeholder */}
        {currentBoardItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-6">
            <div className="pointer-events-auto max-w-md w-full bg-[#12151C]/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-7 text-center shadow-2xl">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-xl mb-4">
                {board.icon || '🎨'}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                Доска «{board.title}» готова к творчеству
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Перетащите изображения прямо с компьютера, добавьте карточки заметок или прикрепите полезные ссылки.
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-slate-200 hover:text-white transition-colors flex flex-col items-center gap-1.5"
                >
                  <ImageIcon size={18} className="text-emerald-400" />
                  <span>Фото</span>
                </button>
                <button
                  onClick={handleAddTextNote}
                  className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-slate-200 hover:text-white transition-colors flex flex-col items-center gap-1.5"
                >
                  <Type size={18} className="text-amber-400" />
                  <span>Заметка</span>
                </button>
                <button
                  onClick={() => setIsLinkModalOpen(true)}
                  className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-slate-200 hover:text-white transition-colors flex flex-col items-center gap-1.5"
                >
                  <Link2 size={18} className="text-blue-400" />
                  <span>Ссылка</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TRANSFORMATION STAGE CONTAINER */}
        <div
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          className="absolute left-0 top-0 w-full h-full pointer-events-none"
        >
          <div className="relative w-full h-full pointer-events-auto">
            {currentBoardItems.map((item) => (
              <BoardItemCard
                key={item.id}
                item={item}
                zoom={zoom}
                isSelected={selectedItemId === item.id}
                onSelect={(id) => setSelectedItemId(id)}
                onPositionChange={(id, x, y) => updateBoardItem(id, { x, y })}
                onSizeChange={(id, width, height) => updateBoardItem(id, { width, height })}
                onUpdate={(id, updates) => updateBoardItem(id, updates)}
                onDelete={(id) => deleteBoardItem(id)}
                onDuplicate={handleDuplicate}
                onOpenLightbox={(url, title) => setLightboxState({ isOpen: true, url, title })}
                onBringToFront={handleBringToFront}
              />
            ))}
          </div>
        </div>

        {/* BOTTOM-RIGHT FLOATING CANVAS CONTROLS (Zoom In/Out, Reset, Pan Indicator) */}
        <div className="absolute bottom-5 right-5 z-30 flex items-center gap-1.5 bg-[#12151C]/90 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-2xl">
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            title="Отдалить"
          >
            <ZoomOut size={16} />
          </button>

          <button
            onClick={handleZoomReset}
            className="px-2 py-1 text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Сбросить масштаб (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            title="Приблизить"
          >
            <ZoomIn size={16} />
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-0.5" />

          <button
            onClick={() => setPan({ x: 80, y: 80 })}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            title="Вернуться к началу"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* BOTTOM-LEFT HELP TIP */}
        <div className="hidden sm:flex items-center gap-2 absolute bottom-5 left-5 z-20 px-3 py-1.5 bg-[#12151C]/70 backdrop-blur-sm border border-white/5 rounded-xl text-[11px] text-slate-400 pointer-events-none">
          <span>💡 Зажмите фон для перемещения • Ctrl+Колесо мыши для масштаба</span>
        </div>
      </div>

      {/* AUXILIARY MODALS */}
      <AddLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSubmit={handleAddLink}
      />

      <BoardLightboxModal
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState({ isOpen: false, url: '', title: '' })}
        imageUrl={lightboxState.url}
        title={lightboxState.title}
      />

      <CreateBoardModal
        isOpen={isEditBoardModalOpen}
        onClose={() => setIsEditBoardModalOpen(false)}
        initialBoard={board}
        onSubmit={(updates) => updateBoard(board.id, updates)}
      />
    </div>
  );
};
