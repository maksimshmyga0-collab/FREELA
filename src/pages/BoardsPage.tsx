import React from 'react';
import { useApp } from '../context/AppContext';
import { BoardsList } from '../components/boards/BoardsList';
import { BoardCanvas } from '../components/boards/BoardCanvas';

export const BoardsPage: React.FC = () => {
  const { boards, activeBoardId, setActiveBoardId } = useApp();

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  if (activeBoard) {
    return <BoardCanvas board={activeBoard} onBack={() => setActiveBoardId(null)} />;
  }

  return <BoardsList />;
};
