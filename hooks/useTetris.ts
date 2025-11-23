import { useState, useCallback, useEffect } from 'react';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  createStage,
  POINTS,
  TETROMINOS,
} from '../constants';
import {
  GameStatus,
  Grid,
  Player,
  TetrominoType,
} from '../types';
import { useInterval } from './useInterval';

const randomTetromino = (): TetrominoType => {
  const tetrominos = Object.values(TetrominoType);
  return tetrominos[Math.floor(Math.random() * tetrominos.length)];
};

const rotateMatrix = (matrix: number[][], dir: number) => {
  // Transpose
  const newM = matrix.map((_, index) => matrix.map((col) => col[index]));
  // Reverse each row to rotate
  if (dir > 0) return newM.map((row) => row.reverse());
  return newM.reverse();
};

export const useTetris = () => {
  const [grid, setGrid] = useState<Grid>(createStage());
  const [score, setScore] = useState(0);
  const [rowsCleared, setRowsCleared] = useState(0);
  const [level, setLevel] = useState(1);
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  
  const [nextPiece, setNextPiece] = useState<TetrominoType>(randomTetromino());
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);

  const [player, setPlayer] = useState<Player>({
    pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
    tetromino: randomTetromino(),
    collided: false,
    rotation: 0,
  });

  // --- Collision Detection ---
  const checkCollision = (
    piece: TetrominoType,
    stage: Grid,
    { x: moveX, y: moveY }: { x: number; y: number },
    rotationMatrix?: number[][]
  ) => {
    const currentShape = rotationMatrix || TETROMINOS[piece].shape;

    for (let y = 0; y < currentShape.length; y += 1) {
      for (let x = 0; x < currentShape[y].length; x += 1) {
        // 1. Check that we're on an actual Tetromino cell
        if (currentShape[y][x] !== 0) {
            const targetY = y + player.pos.y + moveY;
            const targetX = x + player.pos.x + moveX;

            // 2. Check bounds (walls and floor)
            if (targetX < 0 || targetX >= BOARD_WIDTH || targetY >= BOARD_HEIGHT) {
                return true;
            }

            // 3. Check collision with placed pieces
            // We ignore y < 0 (above board) as valid space unless it's out of X bounds
            if (targetY >= 0) {
                if (stage[targetY][targetX] !== null) {
                    return true;
                }
            }
        }
      }
    }
    return false;
  };

  // Helper to get the current rotated shape matrix based on the player state
  const getCurrentPlayerMatrix = (currentTetromino: TetrominoType, rotationCount: number) => {
    let matrix = JSON.parse(JSON.stringify(TETROMINOS[currentTetromino].shape));
    for (let i = 0; i < rotationCount % 4; i++) {
      matrix = rotateMatrix(matrix, 1);
    }
    return matrix;
  };

  const resetGame = () => {
    setGrid(createStage());
    setScore(0);
    setRowsCleared(0);
    setLevel(1);
    setNextPiece(randomTetromino());
    setHoldPiece(null);
    setCanHold(true);
    setPlayer({
      pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
      tetromino: randomTetromino(),
      collided: false,
      rotation: 0,
    });
    setStatus(GameStatus.PLAYING);
  };

  const updatePlayerPos = ({ x, y, collided }: { x: number; y: number; collided: boolean }) => {
    setPlayer((prev) => ({
      ...prev,
      // Fix: Use + instead of += to avoid state mutation in Strict Mode
      pos: { x: prev.pos.x + x, y: prev.pos.y + y },
      collided,
    }));
  };

  const sweepRows = (newGrid: Grid) => {
    let cleared = 0;
    const sweepedGrid = newGrid.reduce((acc, row) => {
      if (row.findIndex((cell) => cell === null) === -1) {
        cleared += 1;
        acc.unshift(new Array(newGrid[0].length).fill(null));
        return acc;
      }
      acc.push(row);
      return acc;
    }, [] as Grid);

    if (cleared > 0) {
      setRowsCleared((prev) => prev + cleared);
      setScore((prev) => {
        const linePoints = [0, POINTS.SINGLE, POINTS.DOUBLE, POINTS.TRIPLE, POINTS.TETRIS];
        return prev + linePoints[cleared] * level;
      });
      setLevel((prev) => Math.floor((rowsCleared + cleared) / 10) + 1);
    }
    return sweepedGrid;
  };

  const drop = () => {
    // Increase level every 10 rows
    if (rowsCleared > (level + 1) * 10) {
      setLevel((prev) => prev + 1);
    }

    const currentMatrix = getCurrentPlayerMatrix(player.tetromino, player.rotation);
    if (!checkCollision(player.tetromino, grid, { x: 0, y: 1 }, currentMatrix)) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Game Over condition
      if (player.pos.y < 1) {
        setStatus(GameStatus.GAMEOVER);
      } else {
        updatePlayerPos({ x: 0, y: 0, collided: true });
      }
    }
  };

  const hardDrop = () => {
    let tempY = 0;
    const currentMatrix = getCurrentPlayerMatrix(player.tetromino, player.rotation);
    while (!checkCollision(player.tetromino, grid, { x: 0, y: tempY + 1 }, currentMatrix)) {
      tempY += 1;
    }
    updatePlayerPos({ x: 0, y: tempY, collided: true });
    setScore((prev) => prev + tempY * POINTS.HARD_DROP);
  };

  const movePlayer = (dir: number) => {
    const currentMatrix = getCurrentPlayerMatrix(player.tetromino, player.rotation);
    if (!checkCollision(player.tetromino, grid, { x: dir, y: 0 }, currentMatrix)) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const playerRotate = () => {
    const currentMatrix = getCurrentPlayerMatrix(player.tetromino, player.rotation);
    const rotatedMatrix = rotateMatrix(currentMatrix, 1);
    
    // Wall kick - simple version
    const pos = player.pos.x;
    let offset = 1;
    
    if (!checkCollision(player.tetromino, grid, { x: 0, y: 0 }, rotatedMatrix)) {
        setPlayer(prev => ({...prev, rotation: prev.rotation + 1}));
        return;
    }

    // Try kicking left/right
    while (offset < 6) { 
        if (!checkCollision(player.tetromino, grid, { x: offset, y: 0 }, rotatedMatrix)) {
             setPlayer(prev => ({
                 ...prev, 
                 pos: { ...prev.pos, x: prev.pos.x + offset },
                 rotation: prev.rotation + 1
             }));
             return;
        }
        if (!checkCollision(player.tetromino, grid, { x: -offset, y: 0 }, rotatedMatrix)) {
             setPlayer(prev => ({
                 ...prev, 
                 pos: { ...prev.pos, x: prev.pos.x - offset },
                 rotation: prev.rotation + 1
             }));
             return;
        }
        offset++;
    }
  };

  const hold = () => {
      if (!canHold) return;

      if (!holdPiece) {
          setHoldPiece(player.tetromino);
          setPlayer({
              pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
              tetromino: nextPiece,
              collided: false,
              rotation: 0
          });
          setNextPiece(randomTetromino());
      } else {
          const current = player.tetromino;
          setPlayer({
            pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
            tetromino: holdPiece,
            collided: false,
            rotation: 0
          });
          setHoldPiece(current);
      }
      setCanHold(false);
  };

  // Game Loop / Tick
  useInterval(() => {
    if (status === GameStatus.PLAYING) {
      drop();
    }
  }, status === GameStatus.PLAYING ? Math.max(100, 1000 / (level * 0.8 + 0.2)) : null);

  // Effect to handle locking the piece
  useEffect(() => {
    if (player.collided) {
      // 1. Lock piece into grid
      const newGrid = [...grid];
      const currentMatrix = getCurrentPlayerMatrix(player.tetromino, player.rotation);
      
      currentMatrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
             const dy = y + player.pos.y;
             const dx = x + player.pos.x;
             if(dy >= 0 && dy < BOARD_HEIGHT && dx >= 0 && dx < BOARD_WIDTH) {
                 newGrid[dy][dx] = player.tetromino;
             }
          }
        });
      });

      // 2. Check lines
      const sweptGrid = sweepRows(newGrid);
      setGrid(sweptGrid);

      // 3. Reset player
      setPlayer({
        pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
        tetromino: nextPiece,
        collided: false,
        rotation: 0,
      });
      setNextPiece(randomTetromino());
      setCanHold(true);
    }
  }, [player.collided]);

  // Ghost Piece Calculation
  const getGhostPos = () => {
    if (status !== GameStatus.PLAYING) return null;
    let tempY = 0;
    const currentMatrix = getCurrentPlayerMatrix(player.tetromino, player.rotation);
    while (!checkCollision(player.tetromino, grid, { x: 0, y: tempY + 1 }, currentMatrix)) {
      tempY += 1;
    }
    return { x: player.pos.x, y: player.pos.y + tempY };
  };

  return {
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
    ghostPos: getGhostPos(),
  };
};