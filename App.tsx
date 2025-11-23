import React, { useEffect, useRef } from 'react';
import { useTetris } from './hooks/useTetris';
import Cell from './components/Cell';
import { Display } from './components/Display';
import { NextPiece } from './components/NextPiece';
import { GameStatus, TetrominoType } from './types';
import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';

const App: React.FC = () => {
  const {
    grid,
    player,
    score,
    level,
    rowsCleared,
    status,
    nextPiece,
    holdPiece,
    resetGame,
    movePlayer,
    playerRotate,
    drop,
    hardDrop,
    hold,
    setStatus,
    getCurrentPlayerMatrix,
    ghostPos,
  } = useTetris();

  const gameAreaRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (status !== GameStatus.PLAYING) {
        if (e.key === 'Enter' && (status === GameStatus.MENU || status === GameStatus.GAMEOVER)) {
            resetGame();
        }
        return;
    }

    // Prevent default browser behavior (scrolling) for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }

    switch (e.key) {
      case 'ArrowLeft':
        movePlayer(-1);
        break;
      case 'ArrowRight':
        movePlayer(1);
        break;
      case 'ArrowDown':
        drop();
        break;
      case 'ArrowUp':
        playerRotate();
        break;
      case ' ':
        hardDrop();
        break;
      case 'c':
      case 'Shift':
        hold();
        break;
      case 'p':
      case 'Escape':
        setStatus(GameStatus.PAUSED);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }); // Removed dependency array to ensure closure freshness or rely on internal hook state refs

  // Construct the display grid by merging the static grid, the active player piece, and the ghost piece
  const displayGrid = grid.map(row => [...row]);

  // 1. Render Ghost Piece
  if (status === GameStatus.PLAYING && ghostPos) {
      const shape = getCurrentPlayerMatrix(player.tetromino, player.rotation);
      shape.forEach((row, y) => {
          row.forEach((value, x) => {
              if (value !== 0) {
                  const dy = y + ghostPos.y;
                  const dx = x + ghostPos.x;
                  if (dy >= 0 && dy < BOARD_HEIGHT && dx >= 0 && dx < BOARD_WIDTH) {
                      // Only draw ghost if the cell is currently empty
                      if(displayGrid[dy][dx] === null) {
                         displayGrid[dy][dx] = 'ghost' as any; 
                      }
                  }
              }
          });
      });
  }

  // 2. Render Active Player Piece
  if (status === GameStatus.PLAYING) {
      const shape = getCurrentPlayerMatrix(player.tetromino, player.rotation);
      shape.forEach((row, y) => {
          row.forEach((value, x) => {
              if (value !== 0) {
                  const dy = y + player.pos.y;
                  const dx = x + player.pos.x;
                  if (dy >= 0 && dy < BOARD_HEIGHT && dx >= 0 && dx < BOARD_WIDTH) {
                      displayGrid[dy][dx] = player.tetromino;
                  }
              }
          });
      });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans selection:bg-transparent overflow-hidden">
      
      <div className="max-w-4xl w-full flex flex-col md:flex-row gap-6 items-start justify-center">
        
        {/* Left Column: Hold & Stats */}
        <div className="hidden md:flex flex-col w-48 gap-4">
           <div className="flex items-center gap-2 mb-4">
             <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
             <h1 className="text-2xl font-bold tracking-tighter italic">NEON TETRIS</h1>
           </div>
           <NextPiece tetromino={holdPiece} label="Hold (C)" />
           <Display label="Score" text={score} />
           <Display label="Level" text={level} />
           <Display label="Lines" text={rowsCleared} />
        </div>

        {/* Center: Game Board */}
        <div 
            className="relative bg-slate-900 border-4 border-slate-800 rounded-xl p-1 shadow-2xl shadow-cyan-500/10"
            style={{ width: 'min(80vw, 340px)', aspectRatio: `${BOARD_WIDTH}/${BOARD_HEIGHT}` }}
            ref={gameAreaRef}
        >
            {/* Grid Container */}
            <div 
                className="grid grid-rows-[repeat(20,1fr)] grid-cols-[repeat(10,1fr)] gap-[1px] w-full h-full bg-slate-800/50"
            >
                {displayGrid.map((row, y) =>
                    row.map((cell, x) => (
                        <Cell key={`${y}-${x}`} type={cell} ghostType={cell === 'ghost' ? player.tetromino : undefined} />
                    ))
                )}
            </div>

            {/* Overlays */}
            {status === GameStatus.MENU && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-500 mb-6 text-center italic">
                        NEON<br/>TETRIS
                    </h1>
                    <button 
                        onClick={resetGame}
                        className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all transform hover:scale-105 active:scale-95"
                    >
                        START GAME
                    </button>
                    <p className="mt-4 text-slate-500 text-sm">Press Enter to Start</p>
                </div>
            )}

            {status === GameStatus.GAMEOVER && (
                <div className="absolute inset-0 bg-red-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                    <h2 className="text-4xl font-bold text-white mb-2">GAME OVER</h2>
                    <p className="text-slate-300 mb-6 text-xl">Score: {score}</p>
                    <button 
                        onClick={resetGame}
                        className="px-8 py-3 bg-white text-red-900 font-bold rounded shadow-lg hover:bg-slate-200 transition-transform hover:scale-105"
                    >
                        TRY AGAIN
                    </button>
                </div>
            )}

            {status === GameStatus.PAUSED && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                    <h2 className="text-3xl font-bold text-white mb-6 tracking-widest">PAUSED</h2>
                    <button 
                        onClick={() => setStatus(GameStatus.PLAYING)}
                        className="px-8 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-500 text-white font-bold rounded"
                    >
                        RESUME
                    </button>
                </div>
            )}
        </div>

        {/* Right Column: Next & Controls Info */}
        <div className="flex flex-col w-48 gap-4">
             {/* Mobile-only Score (visible if Left Column hidden) */}
             <div className="flex md:hidden justify-between gap-2 w-full">
                 <Display label="Score" text={score} />
                 <Display label="Lvl" text={level} />
             </div>

             <NextPiece tetromino={nextPiece} label="Next" />
             
             <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg text-xs text-slate-400 hidden md:block">
                 <h3 className="font-bold text-slate-300 mb-2 uppercase">Controls</h3>
                 <ul className="space-y-1 font-mono">
                     <li className="flex justify-between"><span>Move</span> <span>← →</span></li>
                     <li className="flex justify-between"><span>Rotate</span> <span>↑</span></li>
                     <li className="flex justify-between"><span>Soft Drop</span> <span>↓</span></li>
                     <li className="flex justify-between"><span>Hard Drop</span> <span>Space</span></li>
                     <li className="flex justify-between"><span>Hold</span> <span>C</span></li>
                     <li className="flex justify-between"><span>Pause</span> <span>P</span></li>
                 </ul>
             </div>

             {/* Mobile Controls */}
             <div className="md:hidden grid grid-cols-3 gap-2 mt-4">
                <button className="p-4 bg-slate-800 rounded active:bg-slate-700" onClick={hold}>H</button>
                <button className="p-4 bg-slate-800 rounded active:bg-slate-700" onClick={playerRotate}>↻</button>
                <button className="p-4 bg-slate-800 rounded active:bg-slate-700" onClick={() => setStatus(status === GameStatus.PAUSED ? GameStatus.PLAYING : GameStatus.PAUSED)}>P</button>
                
                <button className="p-4 bg-slate-800 rounded active:bg-slate-700" onClick={() => movePlayer(-1)}>←</button>
                <button className="p-4 bg-slate-800 rounded active:bg-slate-700" onClick={drop}>↓</button>
                <button className="p-4 bg-slate-800 rounded active:bg-slate-700" onClick={() => movePlayer(1)}>→</button>

                <button className="col-span-3 p-4 bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 rounded font-bold active:bg-cyan-600/40 mt-2" onClick={hardDrop}>
                    HARD DROP
                </button>
             </div>
        </div>

      </div>
    </div>
  );
};

export default App;