import React from 'react';
import { TetrominoType } from '../types';
import { TETROMINOS } from '../constants';
import Cell from './Cell';

interface NextPieceProps {
  tetromino: TetrominoType | null;
  label: string;
}

export const NextPiece: React.FC<NextPieceProps> = ({ tetromino, label }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg w-full mb-4 shadow-lg flex flex-col items-center">
      <h3 className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-4 w-full text-left">{label}</h3>
      <div className="grid grid-cols-4 gap-1 w-24 h-24 place-content-center">
        {tetromino ? (
          TETROMINOS[tetromino].shape.map((row, y) =>
            row.map((cell, x) => {
               // Only render the shape itself 
               if (cell) return <div key={`${y}-${x}`} className="w-5 h-5"><Cell type={tetromino} /></div>;
               // Render empty space for shape alignment
               return <div key={`${y}-${x}`} className="w-5 h-5" />;
            })
          )
        ) : (
          <div className="col-span-4 text-slate-600 text-sm italic">Empty</div>
        )}
      </div>
    </div>
  );
};
