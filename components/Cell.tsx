import React from 'react';
import { TetrominoType } from '../types';
import { TETROMINOS } from '../constants';

interface CellProps {
  type: TetrominoType | 'ghost' | 0 | null;
  ghostType?: TetrominoType; // The type of the actual piece if this is a ghost
}

export const Cell: React.FC<CellProps> = ({ type, ghostType }) => {
  const isGhost = type === 'ghost';
  const actualType = isGhost ? ghostType : (type as TetrominoType);
  
  // If empty cell
  if (!type || type === 0) {
    return <div className="w-full h-full bg-slate-900/50 border border-slate-800/30" />;
  }

  const tetro = TETROMINOS[actualType || TetrominoType.I]; // Fallback to I if undefined (shouldn't happen)
  
  if (isGhost) {
     return (
         <div className={`w-full h-full border-2 ${tetro.borderColor} opacity-30 box-border`} />
     );
  }

  return (
    <div className={`w-full h-full ${tetro.color} ${tetro.borderColor} border-t-2 border-l-2 border-r-2 border-b-4 rounded-sm shadow-sm relative overflow-hidden`}>
        {/* Shine effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 pointer-events-none" />
    </div>
  );
};

// Memoize to prevent unnecessary re-renders of hundreds of cells
export default React.memo(Cell);
