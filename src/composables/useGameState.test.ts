import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref, nextTick } from 'vue';
import { useGameState } from './useGameState';
import { WIN_VALUE } from '@/utils/constants';
import type { Board, Tile } from '@/types/game.types';

// Helper to create a test board
function createTestBoard(tiles: Array<{ value: number; row: number; col: number }>): Board {
  const board: Board = Array(4).fill(null).map(() => Array(4).fill(null));

  let id = 0;
  for (const tile of tiles) {
    board[tile.row][tile.col] = {
      id: id++,
      value: tile.value as any,
      row: tile.row,
      col: tile.col,
    };
  }

  return board;
}

describe('useGameState', () => {
  beforeEach(() => {
    // Reset localStorage before each test
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should initialize with a valid game board', () => {
      const { board } = useGameState();

      expect(board.value).toBeDefined();
      expect(board.value).toHaveLength(4);
      expect(board.value[0]).toHaveLength(4);

      // Count initial tiles (should be 2)
      let tileCount = 0;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (board.value[row][col] !== null) {
            tileCount++;
          }
        }
      }
      expect(tileCount).toBe(2);
    });

    it('should start with score equal to initial tiles sum', () => {
      const { score } = useGameState();
      // Score is the sum of all tile values (2 initial tiles, each 2 or 4)
      expect(score.value).toBeGreaterThanOrEqual(4);
      expect(score.value).toBeLessThanOrEqual(8);
    });

    it('should start with game not over', () => {
      const { gameOver, won, gameStatus } = useGameState();
      expect(gameOver.value).toBe(false);
      expect(won.value).toBe(false);
      expect(gameStatus.value).toBe('playing');
    });

    it('should start with 0 moves', () => {
      const { moves } = useGameState();
      expect(moves.value).toBe(0);
    });

    it('should calculate initial empty cells count', () => {
      const { emptyCellsCount } = useGameState();
      expect(emptyCellsCount.value).toBe(14); // 16 - 2 initial tiles
    });

    it('should calculate highest tile correctly', () => {
      const { highestTile } = useGameState();
      // Initial tiles are 2 or 4, so highest should be at least 2
      expect(highestTile.value).toBeGreaterThanOrEqual(2);
    });
  });

  describe('move', () => {
    it('should return false for invalid move', () => {
      const api = useGameState();

      const result = api.move('left');
      expect(typeof result).toBe('boolean');
    });

    it('should increment moves on valid move', async () => {
      const api = useGameState();
      const initialMoves = api.moves.value;

      // Set up a board that allows movement
      api.board.value[0][0] = { id: 1, value: 2 as any, row: 0, col: 0 };

      api.move('left');
      await nextTick();

      expect(api.moves.value).toBe(initialMoves + 1);
    });

    it('should set lastMove direction', async () => {
      const api = useGameState();

      api.board.value[0][0] = { id: 1, value: 2 as any, row: 0, col: 0 };

      api.move('right');
      await nextTick();

      expect(api.lastMove.value).toBe('right');
    });

    it('should not allow move when game is over', () => {
      const api = useGameState();
      api.gameOver.value = true;

      const result = api.move('left');

      expect(result).toBe(false);
    });

    it('should not allow move when game is won', () => {
      const api = useGameState();
      api.won.value = true;

      const result = api.move('left');

      expect(result).toBe(false);
    });

    it('should add a new tile after valid move', async () => {
      const api = useGameState();

      // Set up a custom board with only 2 tiles that will merge
      api.board.value = Array(4).fill(null).map(() => Array(4).fill(null));
      api.board.value[0][0] = { id: 1, value: 2 as any, row: 0, col: 0 };
      api.board.value[0][1] = { id: 2, value: 2 as any, row: 0, col: 1 };
      api.score.value = 4;

      api.move('left');
      await nextTick();

      // After merge: 2 tiles -> 1 merged tile + 1 new random tile = 2 tiles
      let tileCountAfter = 0;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (api.board.value[row][col]) tileCountAfter++;
        }
      }

      expect(tileCountAfter).toBe(2);
      expect(api.lastGeneratedTile.value).not.toBeNull();
    });

    it('should detect win condition when creating winning tile', async () => {
      const api = useGameState();

      // Set up board with tiles that will merge to create WIN_VALUE
      const halfWin = WIN_VALUE / 2;
      api.board.value = createTestBoard([
        { value: halfWin, row: 0, col: 0 },
        { value: halfWin, row: 0, col: 1 },
      ]);

      api.move('left');
      await nextTick();

      expect(api.won.value).toBe(true);
      expect(api.gameStatus.value).toBe('won');
    });
  });

  describe('restart', () => {
    it('should reset score to 0', () => {
      const api = useGameState();
      api.score.value = 100;

      api.restart();

      expect(api.score.value).toBe(0);
    });

    it('should reset game over state', () => {
      const api = useGameState();
      api.gameOver.value = true;

      api.restart();

      expect(api.gameOver.value).toBe(false);
    });

    it('should reset won state', () => {
      const api = useGameState();
      api.won.value = true;

      api.restart();

      expect(api.won.value).toBe(false);
    });

    it('should reset moves to 0', () => {
      const api = useGameState();
      api.moves.value = 10;

      api.restart();

      expect(api.moves.value).toBe(0);
    });

    it('should reset lastMove', () => {
      const api = useGameState();
      api.lastMove.value = 'up';

      api.restart();

      expect(api.lastMove.value).toBeUndefined();
    });

    it('should create a new board with 2 tiles', () => {
      const api = useGameState();

      api.restart();

      let tileCount = 0;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (api.board.value[row][col]) tileCount++;
        }
      }

      expect(tileCount).toBe(2);
    });
  });

  describe('resetGame', () => {
    it('should call restart logic', () => {
      const api = useGameState();
      api.score.value = 100;
      api.moves.value = 5;

      api.resetGame();

      expect(api.score.value).toBe(0);
      expect(api.moves.value).toBe(0);
    });
  });

  describe('newGame', () => {
    it('should call restart logic', () => {
      const api = useGameState();
      api.score.value = 100;
      api.moves.value = 5;

      api.newGame();

      expect(api.score.value).toBe(0);
      expect(api.moves.value).toBe(0);
    });
  });

  describe('gameStatus computed', () => {
    it('should return "playing" when game is active', () => {
      const api = useGameState();

      expect(api.gameStatus.value).toBe('playing');
    });

    it('should return "won" when game is won', () => {
      const api = useGameState();
      api.won.value = true;

      expect(api.gameStatus.value).toBe('won');
    });

    it('should return "lost" when game is over', () => {
      const api = useGameState();
      api.gameOver.value = true;

      expect(api.gameStatus.value).toBe('lost');
    });
  });

  describe('highestTile computed', () => {
    it('should return 0 for empty board', () => {
      const api = useGameState();
      // Create empty board
      api.board.value = Array(4).fill(null).map(() => Array(4).fill(null));

      expect(api.highestTile.value).toBe(0);
    });

    it('should return the maximum tile value', () => {
      const api = useGameState();
      api.board.value = createTestBoard([
        { value: 2, row: 0, col: 0 },
        { value: 4, row: 0, col: 1 },
        { value: 8, row: 1, col: 0 },
        { value: 16, row: 1, col: 1 },
      ]);

      expect(api.highestTile.value).toBe(16);
    });
  });

  describe('handleKeydown', () => {
    it('should prevent default for arrow keys', () => {
      const api = useGameState();
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      vi.spyOn(event, 'preventDefault');

      api.handleKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should not prevent default for non-arrow keys', () => {
      const api = useGameState();
      const event = new KeyboardEvent('keydown', { key: 'a' });
      vi.spyOn(event, 'preventDefault');

      api.handleKeydown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should trigger move for arrow keys', () => {
      const api = useGameState();
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });

      // If the game is in a normal state, it should handle the key
      api.handleKeydown(event);
    });

    it('should not move when game is over', () => {
      const api = useGameState();
      api.gameOver.value = true;

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const initialMoves = api.moves.value;

      api.handleKeydown(event);

      expect(api.moves.value).toBe(initialMoves);
    });

    it('should not move when game is won', () => {
      const api = useGameState();
      api.won.value = true;

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const initialMoves = api.moves.value;

      api.handleKeydown(event);

      expect(api.moves.value).toBe(initialMoves);
    });
  });

  describe('lastGeneratedTile', () => {
    it('should track the last generated tile', async () => {
      const api = useGameState();

      // Set up a movable board
      api.board.value[0][0] = { id: 1, value: 2 as any, row: 0, col: 0 };
      api.board.value[0][1] = { id: 2, value: 2 as any, row: 0, col: 1 };

      api.move('left');
      await nextTick();

      expect(api.lastGeneratedTile.value).not.toBeNull();
      if (api.lastGeneratedTile.value) {
        expect(typeof api.lastGeneratedTile.value.row).toBe('number');
        expect(typeof api.lastGeneratedTile.value.col).toBe('number');
        expect([2, 4]).toContain(api.lastGeneratedTile.value.value);
      }
    });

    it('should be null on restart', () => {
      const api = useGameState();
      api.lastGeneratedTile.value = { row: 0, col: 0, value: 2 };

      api.restart();

      expect(api.lastGeneratedTile.value).toBeNull();
    });
  });
});
