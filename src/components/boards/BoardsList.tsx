import React, { useState } from 'react';
import {
  Plus,
  LayoutGrid,
  Search,
  Calendar,
  Layers,
  Image as ImageIcon,
  Type,
  Link2,
  Trash2,
  Edit2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Board } from '../../types';
import { CreateBoardModal } from './CreateBoardModal';

export const BoardsList: React.FC = () => {
  const {
    boards,
    boardItems,
    createBoard,
    updateBoard,
    deleteBoard,
    setActiveBoardId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);

  // Filter boards by query
  const filteredBoards = boards.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q));
  });

  const handleEditBoard = (board: Board, e: React.MouseEvent) => {
    e.stopPropagation();
    setBoardToEdit(board);
    setIsCreateModalOpen(true);
  };

  const handleDeleteBoard = (board: Board, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBoard(board.id);
  };

  const handleModalSubmit = (data: { title: string; description?: string; color?: string; icon?: string }) => {
    if (boardToEdit) {
      updateBoard(boardToEdit.id, data);
      setBoardToEdit(null);
    } else {
      createBoard(data);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center text-sm font-semibold">
              <LayoutGrid size={17} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Доски
            </h1>
            <span className="text-xs bg-white/[0.06] text-slate-400 px-2.5 py-0.5 rounded-full font-medium">
              {boards.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Визуальное рабочее пространство для мудбордов, референсов, идей и ссылок
          </p>
        </div>
        <button
          onClick={() => {
            setBoardToEdit(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all min-h-[40px] whitespace-nowrap self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Создать доску</span>
        </button>
      </div>

      {/* Search Bar (if boards > 1) */}
      {boards.length > 1 && (
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или описанию..."
            className="w-full pl-9 pr-3.5 py-2 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-white/25 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
      )}

      {/* Boards Grid or Empty State */}
      {boards.length === 0 ? (
        <div className="bg-[#10131A] border border-white/[0.08] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xl my-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center text-2xl mb-4">
            🎨
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mb-2">
            У вас пока нет досок
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
            Создайте первую доску, чтобы собирать референсы, заметки, изображения и ссылки в едином свободном визуальном пространстве.
          </p>
          <button
            onClick={() => {
              setBoardToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Создать доску</span>
          </button>
        </div>
      ) : filteredBoards.length === 0 ? (
        <div className="bg-[#10131A] border border-white/[0.08] rounded-2xl p-8 text-center text-slate-400 text-xs sm:text-sm">
          По запросу «{searchQuery}» ничего не найдено
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBoards.map((board) => {
            const items = boardItems.filter((i) => i.boardId === board.id);
            const imageCount = items.filter((i) => i.type === 'image').length;
            const textCount = items.filter((i) => i.type === 'text').length;
            const linkCount = items.filter((i) => i.type === 'link').length;

            return (
              <div
                key={board.id}
                onClick={() => setActiveBoardId(board.id)}
                className="group relative bg-[#12151C] hover:bg-[#151922] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-5 cursor-pointer transition-all duration-150 shadow-lg hover:shadow-xl flex flex-col justify-between"
              >
                {/* Accent top stripe or dot */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner"
                        style={{
                          backgroundColor: `${board.color || '#3B82F6'}20`,
                          border: `1px solid ${board.color || '#3B82F6'}40`,
                        }}
                      >
                        {board.icon || '🎨'}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                          {board.title}
                        </h2>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={11} />
                          <span>
                            {new Date(board.updatedAt || board.createdAt).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditBoard(board, e)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
                        title="Редактировать название"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteBoard(board, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Удалить доску"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {board.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed font-normal">
                      {board.description}
                    </p>
                  )}
                </div>

                {/* Footer: Breakdown of items */}
                <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Изображения">
                      <ImageIcon size={12} className="text-emerald-400" />
                      <span>{imageCount}</span>
                    </span>
                    <span className="flex items-center gap-1" title="Заметки">
                      <Type size={12} className="text-amber-400" />
                      <span>{textCount}</span>
                    </span>
                    <span className="flex items-center gap-1" title="Ссылки">
                      <Link2 size={12} className="text-blue-400" />
                      <span>{linkCount}</span>
                    </span>
                  </div>

                  <span className="text-slate-400 group-hover:text-white font-medium flex items-center gap-1 transition-colors">
                    <span>Открыть</span>
                    <ExternalLink size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Board Modal */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setBoardToEdit(null);
        }}
        initialBoard={boardToEdit}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};
