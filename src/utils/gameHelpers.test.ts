import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Board, Tile } from '@/types/game.types';
import {
  createTile,
  initializeBoard,
  getEmptyCells,
  generateRandomTileValue,
  addRandomTile,
  initializeGame,
  slideRow,
  rotateBoard,
  moveBoard,
  checkGameOver,
  checkWin,
  getCurrentScore,
} from './gameHelpers';
import { BOARD_SIZE, WIN_VALUE, TILE_PROBABILITIES } from './constants';

describe('gameHelpers', () => {
  beforeEach(() => {
    // Reset tile ID counter before each test
    vi.resetModules();
  });

  describe('createTile', () => {
    it('should create a tile with correct properties', () => {
      const tile = createTile(2, 0, 0);
      expect(tile.value).toBe(2);
      expect(tile.row).toBe(0);
      expect(tile.col).toBe(0);
      expect(tile.id).toBeGreaterThanOrEqual(0);
    });

    it('should create unique tile IDs', () => {
      const tile1 = createTile(2, 0, 0);
      const tile2 = createTile(4, 1, 1);
      expect(tile1.id).not.toBe(tile2.id);
    });
  });

  describe('initializeBoard', () => {
    it('should create a 4x4 board with all null cells', () => {
      const board = initializeBoard();
      expect(board).toHaveLength(BOARD_SIZE);
      expect(board[0]).toHaveLength(BOARD_SIZE);
      expect(board.every(row => row.every(cell => cell === null))).toBe(true);
    });
  });

  describe('getEmptyCells', () => {
    it('should return all 16 cells for an empty board', () => {
      const board = initializeBoard();
      const emptyCells = getEmptyCells(board);
      expect(emptyCells).toHaveLength(16);
    });

    it('should return no cells for a full board', () => {
      const board: Board = Array(BOARD_SIZE).fill(null).map((_, row) =>
        Array(BOARD_SIZE).fill(null).map((_, col) => createTile(2, row, col))
      );
      const emptyCells = getEmptyCells(board);
      expect(emptyCells).toHaveLength(0);
    });

    it('should return correct empty cells count', () => {
      const board = initializeBoard();
      board[0][0] = createTile(2, 0, 0);
      board[1][1] = createTile(4, 1, 1);

      const emptyCells = getEmptyCells(board);
      expect(emptyCells).toHaveLength(14);
    });
  });

  describe('generateRandomTileValue', () => {
    it('should only return 2 or 4', () => {
      const values = new Set<number>();
      for (let i = 0; i < 100; i++) {
        values.add(generateRandomTileValue());
      }
      expect(values).toEqual(new Set([2, 4]));
    });

    it('should follow probability distribution (approximately)', () => {
      const counts = { 2: 0, 4: 0 };
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const value = generateRandomTileValue();
        counts[value]++;
      }

      const ratio2 = counts[2] / iterations;
      const ratio4 = counts[4] / iterations;

      // 90% for 2, 10% for 4 - allow some variance
      expect(ratio2).toBeGreaterThan(0.85);
      expect(ratio2).toBeLessThan(0.95);
      expect(ratio4).toBeGreaterThan(0.05);
      expect(ratio4).toBeLessThan(0.15);
    });
  });

  describe('addRandomTile', () => {
    it('should add a tile to an empty board', () => {
      const board = initializeBoard();
      const result = addRandomTile(board);

      expect(result.tile).not.toBeNull();
      expect(getEmptyCells(result.board)).toHaveLength(15);
    });

    it('should not add a tile to a full board', () => {
      const board: Board = Array(BOARD_SIZE).fill(null).map((_, row) =>
        Array(BOARD_SIZE).fill(null).map((_, col) => createTile(2, row, col))
      );
      const result = addRandomTile(board);

      expect(result.tile).toBeNull();
      expect(result.board).toEqual(board);
    });

    it('should place tile in an empty cell', () => {
      const board = initializeBoard();
      board[0][0] = createTile(2, 0, 0);

      const result = addRandomTile(board);
      expect(result.tile).not.toBeNull();

      // The new tile should not be placed at (0, 0)
      if (result.tile) {
        expect(result.tile.row === 0 && result.tile.col === 0).toBe(false);
      }
    });
  });

  describe('initializeGame', () => {
    it('should create a board with exactly 2 tiles', () => {
      const board = initializeGame();
      let tileCount = 0;

      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (board[row][col] !== null) {
            tileCount++;
          }
        }
      }

      expect(tileCount).toBe(2);
    });

    it('should create tiles with valid positions', () => {
      const board = initializeGame();

      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const tile = board[row][col];
          if (tile) {
            expect(tile.row).toBe(row);
            expect(tile.col).toBe(col);
            expect([2, 4]).toContain(tile.value);
          }
        }
      }
    });
  });

  describe('slideRow', () => {
    it('should slide tiles to the left', () => {
      const row: Array<Tile | null> = [null, null, createTile(2, 0, 2), createTile(4, 0, 3)];
      const result = slideRow(row);

      expect(result.cells[0]).not.toBeNull();
      expect(result.cells[1]).not.toBeNull();
      expect(result.cells[2]).toBeNull();
      expect(result.cells[3]).toBeNull();
    });

    it('should merge adjacent tiles with same value', () => {
      const row: Array<Tile | null> = [
        createTile(2, 0, 0),
        createTile(2, 0, 1),
        null,
        null
      ];
      const result = slideRow(row);

      expect(result.cells[0]?.value).toBe(4);
      expect(result.cells[1]).toBeNull();
      expect(result.score).toBe(4);
      expect(result.changed).toBe(true);
    });

    it('should merge multiple pairs correctly', () => {
      const row: Array<Tile | null> = [
        createTile(2, 0, 0),
        createTile(2, 0, 1),
        createTile(4, 0, 2),
        createTile(4, 0, 3)
      ];
      const result = slideRow(row);

      expect(result.cells[0]?.value).toBe(4);
      expect(result.cells[1]?.value).toBe(8);
      expect(result.cells[2]).toBeNull();
      expect(result.cells[3]).toBeNull();
      expect(result.score).toBe(12);
    });

    it('should merge tiles that become adjacent after sliding', () => {
      const row: Array<Tile | null> = [
        createTile(2, 0, 0),
        null,
        createTile(2, 0, 2),
        null
      ];
      const result = slideRow(row);

      // Tiles slide left and become adjacent, then merge
      expect(result.cells[0]?.value).toBe(4);
      expect(result.cells[1]).toBeNull();
      expect(result.cells[2]).toBeNull();
      expect(result.cells[3]).toBeNull();
      expect(result.score).toBe(4);
      expect(result.changed).toBe(true);
    });

    it('should detect when nothing changes', () => {
      const row: Array<Tile | null> = [
        createTile(2, 0, 0),
        null,
        null,
        null
      ];
      const result = slideRow(row);

      expect(result.changed).toBe(false);
    });

    it('should correctly handle a row that cannot be merged', () => {
      const row: Array<Tile | null> = [
        createTile(2, 0, 0),
        createTile(4, 0, 1),
        createTile(8, 0, 2),
        createTile(16, 0, 3)
      ];
      const result = slideRow(row);

      expect(result.cells[0]?.value).toBe(2);
      expect(result.cells[1]?.value).toBe(4);
      expect(result.cells[2]?.value).toBe(8);
      expect(result.cells[3]?.value).toBe(16);
      expect(result.changed).toBe(false);
      expect(result.score).toBe(0);
    });
  });

  describe('rotateBoard', () => {
    it('should rotate board 90 degrees clockwise', () => {
      const board = initializeBoard();
      board[0][0] = createTile(1, 0, 0);
      board[0][3] = createTile(2, 0, 3);

      const rotated = rotateBoard(board, 1);

      expect(rotated[0][3]?.value).toBe(1);
      expect(rotated[3][3]?.value).toBe(2);
    });

    it('should rotate board 180 degrees', () => {
      const board = initializeBoard();
      board[0][0] = createTile(1, 0, 0);
      board[0][3] = createTile(2, 0, 3);

      const rotated = rotateBoard(board, 2);

      expect(rotated[3][3]?.value).toBe(1);
      expect(rotated[3][0]?.value).toBe(2);
    });

    it('should rotate board 270 degrees clockwise', () => {
      const board = initializeBoard();
      board[0][0] = createTile(1, 0, 0);
      board[0][3] = createTile(2, 0, 3);

      const rotated = rotateBoard(board, 3);

      expect(rotated[3][0]?.value).toBe(1);
      expect(rotated[0][0]?.value).toBe(2);
    });

    it('should handle 0 rotations (identity)', () => {
      const board = initializeBoard();
      board[0][0] = createTile(1, 0, 0);

      const rotated = rotateBoard(board, 0);

      expect(rotated[0][0]?.value).toBe(1);
    });
  });

  describe('moveBoard', () => {
    it('should move tiles left', () => {
      const board = initializeBoard();
      board[0][1] = createTile(2, 0, 1);
      board[0][3] = createTile(4, 0, 3);

      const result = moveBoard(board, 'left');

      expect(result.board[0][0]?.value).toBe(2);
      expect(result.board[0][1]?.value).toBe(4);
      expect(result.board[0][2]).toBeNull();
      expect(result.changed).toBe(true);
    });

    it('should move tiles right', () => {
      const board = initializeBoard();
      board[0][0] = createTile(2, 0, 0);
      board[0][2] = createTile(4, 0, 2);

      const result = moveBoard(board, 'right');

      expect(result.board[0][2]?.value).toBe(2);
      expect(result.board[0][3]?.value).toBe(4);
      expect(result.board[0][0]).toBeNull();
      expect(result.changed).toBe(true);
    });

    it('should move tiles up', () => {
      const board = initializeBoard();
      board[1][0] = createTile(2, 1, 0);
      board[3][0] = createTile(4, 3, 0);

      const result = moveBoard(board, 'up');

      expect(result.board[0][0]?.value).toBe(2);
      expect(result.board[1][0]?.value).toBe(4);
      expect(result.board[2][0]).toBeNull();
      expect(result.changed).toBe(true);
    });

    it('should move tiles down', () => {
      const board = initializeBoard();
      board[0][0] = createTile(2, 0, 0);
      board[2][0] = createTile(4, 2, 0);

      const result = moveBoard(board, 'down');

      expect(result.board[2][0]?.value).toBe(2);
      expect(result.board[3][0]?.value).toBe(4);
      expect(result.board[0][0]).toBeNull();
      expect(result.changed).toBe(true);
    });

    it('should merge tiles and calculate score correctly when moving left', () => {
      const board = initializeBoard();
      board[0][0] = createTile(2, 0, 0);
      board[0][1] = createTile(2, 0, 1);
      board[0][2] = createTile(4, 0, 2);
      board[0][3] = createTile(4, 0, 3);

      const result = moveBoard(board, 'left');

      expect(result.board[0][0]?.value).toBe(4);
      expect(result.board[0][1]?.value).toBe(8);
      expect(result.score).toBe(12);
      expect(result.changed).toBe(true);
    });

    it('should not change board when move is invalid', () => {
      const board = initializeBoard();
      // Tiles already at rightmost positions, can't move right
      board[0][2] = createTile(2, 0, 2);
      board[0][3] = createTile(4, 0, 3);

      const result = moveBoard(board, 'right');

      expect(result.board[0][2]?.value).toBe(2);
      expect(result.board[0][3]?.value).toBe(4);
      expect(result.score).toBe(0);
      expect(result.changed).toBe(false);
    });

    it('should update tile positions after move', () => {
      const board = initializeBoard();
      board[0][3] = createTile(2, 0, 3);

      const result = moveBoard(board, 'left');

      expect(result.board[0][0]?.row).toBe(0);
      expect(result.board[0][0]?.col).toBe(0);
    });
  });

  describe('checkGameOver', () => {
    it('should return false when there are empty cells', () => {
      const board = initializeBoard();
      board[0][0] = createTile(2, 0, 0);

      expect(checkGameOver(board)).toBe(false);
    });

    it('should return false when adjacent tiles can merge horizontally', () => {
      const board = initializeBoard();
      // Fill all cells
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          board[row][col] = createTile(2, row, col);
        }
      }

      expect(checkGameOver(board)).toBe(false);
    });

    it('should return false when adjacent tiles can merge vertically', () => {
      const board = initializeBoard();
      // Fill all cells with alternating values
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          board[row][col] = createTile(2, row, col);
        }
      }
      // Create a vertical merge possibility
      board[1][1] = createTile(2, 1, 1);

      expect(checkGameOver(board)).toBe(false);
    });

    it('should return true when no moves are possible', () => {
      const board = initializeBoard();
      // Create a board with no possible moves (checkerboard pattern)
      board[0] = [createTile(2, 0, 0), createTile(4, 0, 1), createTile(2, 0, 2), createTile(4, 0, 3)];
      board[1] = [createTile(4, 1, 0), createTile(2, 1, 1), createTile(4, 1, 2), createTile(2, 1, 3)];
      board[2] = [createTile(2, 2, 0), createTile(4, 2, 1), createTile(2, 2, 2), createTile(4, 2, 3)];
      board[3] = [createTile(4, 3, 0), createTile(2, 3, 1), createTile(4, 3, 2), createTile(2, 3, 3)];

      expect(checkGameOver(board)).toBe(true);
    });
  });

  describe('checkWin', () => {
    it('should return true when a tile reaches or exceeds WIN_VALUE', () => {
      const board = initializeBoard();
      board[0][0] = createTile(WIN_VALUE, 0, 0);

      expect(checkWin(board)).toBe(true);
    });

    it('should return true when a tile exceeds WIN_VALUE', () => {
      const board = initializeBoard();
      board[0][0] = createTile(WIN_VALUE * 2 as any, 0, 0);

      expect(checkWin(board)).toBe(true);
    });

    it('should return false when no tile reaches WIN_VALUE', () => {
      const board = initializeGame();

      expect(checkWin(board)).toBe(false);
    });
  });

  describe('getCurrentScore', () => {
    it('should return 0 for an empty board', () => {
      const board = initializeBoard();

      expect(getCurrentScore(board)).toBe(0);
    });

    it('should sum all tile values', () => {
      const board = initializeBoard();
      board[0][0] = createTile(2, 0, 0);
      board[0][1] = createTile(4, 0, 1);
      board[1][0] = createTile(8, 1, 0);

      expect(getCurrentScore(board)).toBe(14);
    });
  });
});
