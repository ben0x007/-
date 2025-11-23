import { TetrominoType, TetrominoShape } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Standard Tetromino shapes defined in a 4x4 or 3x3 grid logic
// Using standard SRS (Super Rotation System) relative coordinates would be ideal,
// but simple matrices work well for this implementation.
export const TETROMINOS: Record<TetrominoType, TetrominoShape> = {
  [TetrominoType.I]: {
    shape: [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    color: 'bg-cyan-400',
    borderColor: 'border-cyan-300',
    shadowColor: 'shadow-cyan-400/50',
  },
  [TetrominoType.J]: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    color: 'bg-blue-500',
    borderColor: 'border-blue-400',
    shadowColor: 'shadow-blue-500/50',
  },
  [TetrominoType.L]: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    color: 'bg-orange-500',
    borderColor: 'border-orange-400',
    shadowColor: 'shadow-orange-500/50',
  },
  [TetrominoType.O]: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'bg-yellow-400',
    borderColor: 'border-yellow-300',
    shadowColor: 'shadow-yellow-400/50',
  },
  [TetrominoType.S]: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: 'bg-green-500',
    borderColor: 'border-green-400',
    shadowColor: 'shadow-green-500/50',
  },
  [TetrominoType.T]: {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ],
    color: 'bg-purple-500',
    borderColor: 'border-purple-400',
    shadowColor: 'shadow-purple-500/50',
  },
  [TetrominoType.Z]: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-red-500',
    borderColor: 'border-red-400',
    shadowColor: 'shadow-red-500/50',
  },
};

// Initial empty grid
export const createStage = () =>
  Array.from(Array(BOARD_HEIGHT), () =>
    new Array(BOARD_WIDTH).fill(null)
  );

export const POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
};
