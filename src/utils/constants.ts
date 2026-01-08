import type { GameConfig, TileValue } from '@/types/game.types';

export const BOARD_SIZE = 4;
export const INITIAL_TILES = 2;
export const WIN_VALUE: TileValue = 2048;

// Probability distribution for new tiles (90% chance for 2, 10% chance for 4)
export const TILE_PROBABILITIES: Record<TileValue, number> = {
  2: 0.9,
  4: 0.1,
  8: 0,
  16: 0,
  32: 0,
  64: 0,
  128: 0,
  256: 0,
  512: 0,
  1024: 0,
  2048: 0,
  4096: 0,
  8192: 0,
  16384: 0,
  32768: 0,
  65536: 0,
};

export const DEFAULT_CONFIG: GameConfig = {
  size: BOARD_SIZE,
  initialTiles: INITIAL_TILES,
  winValue: WIN_VALUE,
  probabilities: TILE_PROBABILITIES,
};

// Color mapping for tile values
export const TILE_COLORS: Record<TileValue, string> = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
  4096: '#5eda92',
  8192: '#3ecf82',
  16384: '#2ecf74',
  32768: '#1ecf64',
  65536: '#0ecf54',
};

// Text colors (light or dark) based on tile value
export const TEXT_COLORS: Record<TileValue, string> = {
  2: '#776e65',
  4: '#776e65',
  8: '#f9f6f2',
  16: '#f9f6f2',
  32: '#f9f6f2',
  64: '#f9f6f2',
  128: '#f9f6f2',
  256: '#f9f6f2',
  512: '#f9f6f2',
  1024: '#f9f6f2',
  2048: '#f9f6f2',
  4096: '#f9f6f2',
  8192: '#f9f6f2',
  16384: '#f9f6f2',
  32768: '#f9f6f2',
  65536: '#f9f6f2',
};