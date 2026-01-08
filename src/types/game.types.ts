export type TileValue = 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 32768 | 65536;

export interface Tile {
  id: number;
  value: TileValue;
  row: number;
  col: number;
  mergedFrom?: [Tile, Tile]; // Tracks which tiles merged to create this one (for animations)
}

export type Cell = Tile | null;
export type Board = Cell[][];

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GameState {
  board: Board;
  score: number;
  gameOver: boolean;
  won: boolean;
  moves: number;
  lastMove?: Direction;
  lastGeneratedTile?: { row: number; col: number; value: TileValue };
}

export interface GameConfig {
  size: number;
  initialTiles: number;
  winValue: TileValue;
  probabilities: {
    [key: number]: number; // value -> probability (e.g., 2: 0.9, 4: 0.1)
  };
}

export type GameStatus = 'playing' | 'won' | 'lost';