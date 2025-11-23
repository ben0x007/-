export enum TetrominoType {
  I = 'I',
  J = 'J',
  L = 'L',
  O = 'O',
  S = 'S',
  T = 'T',
  Z = 'Z',
}

export type GridCell = TetrominoType | null;
export type Grid = GridCell[][];

export interface TetrominoShape {
  shape: number[][];
  color: string;
  borderColor: string;
  shadowColor: string;
}

export interface Player {
  pos: { x: number; y: number };
  tetromino: TetrominoType;
  collided: boolean;
  rotation: number; // 0, 1, 2, 3
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER',
}

export interface GameState {
  grid: Grid;
  player: Player;
  score: number;
  rowsCleared: number;
  level: number;
  status: GameStatus;
  nextPiece: TetrominoType;
  holdPiece: TetrominoType | null;
  canHold: boolean;
}