import type { Board, Cell, Tile, TileValue, Direction, GameState } from '@/types/game.types';
import { BOARD_SIZE, WIN_VALUE, TILE_PROBABILITIES } from './constants';

let tileIdCounter = 0;

export function createTile(value: TileValue, row: number, col: number): Tile {
  return {
    id: tileIdCounter++,
    value,
    row,
    col,
  };
}

export function initializeBoard(): Board {
  const board: Board = Array(BOARD_SIZE).fill(null).map(() =>
    Array(BOARD_SIZE).fill(null)
  );
  return board;
}

export function getEmptyCells(board: Board): Array<[number, number]> {
  const emptyCells: Array<[number, number]> = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        emptyCells.push([row, col]);
      }
    }
  }
  return emptyCells;
}

export function generateRandomTileValue(): TileValue {
  const random = Math.random();
  let cumulative = 0;

  for (const [value, probability] of Object.entries(TILE_PROBABILITIES)) {
    cumulative += probability;
    if (random < cumulative) {
      return parseInt(value) as TileValue;
    }
  }

  // Fallback to 2 if probabilities don't sum to 1
  return 2;
}

export function addRandomTile(board: Board): { board: Board; tile: Tile | null } {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) {
    return { board, tile: null };
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const [row, col] = emptyCells[randomIndex];
  const value = generateRandomTileValue();
  const tile = createTile(value, row, col);

  const newBoard = [...board.map(row => [...row])];
  newBoard[row][col] = tile;

  return { board: newBoard, tile };
}

export function initializeGame(): Board {
  let board = initializeBoard();

  // Add initial tiles
  for (let i = 0; i < 2; i++) {
    const result = addRandomTile(board);
    board = result.board;
  }

  return board;
}

export function slideRow(row: Cell[]): { cells: Cell[]; score: number; changed: boolean } {
  let score = 0;
  let changed = false;

  // Filter out null cells
  const nonNullCells = row.filter(cell => cell !== null);

  // Merge adjacent cells with same value
  const mergedCells: Cell[] = [];
  let i = 0;

  while (i < nonNullCells.length) {
    if (i + 1 < nonNullCells.length && nonNullCells[i]!.value === nonNullCells[i + 1]!.value) {
      // Merge cells
      const mergedTile: Tile = {
        ...nonNullCells[i]!,
        value: (nonNullCells[i]!.value * 2) as TileValue,
        mergedFrom: [nonNullCells[i]!, nonNullCells[i + 1]!],
      };
      mergedCells.push(mergedTile);
      score += mergedTile.value;
      i += 2;
    } else {
      mergedCells.push(nonNullCells[i]);
      i += 1;
    }
  }

  // Fill the rest with null
  const resultCells = [...mergedCells, ...Array(BOARD_SIZE - mergedCells.length).fill(null)];

  // Check if anything changed
  changed = JSON.stringify(row) !== JSON.stringify(resultCells);

  return { cells: resultCells, score, changed };
}

export function rotateBoard(board: Board, times: number): Board {
  let rotatedBoard = board;

  for (let t = 0; t < times; t++) {
    const newBoard = initializeBoard();
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        newBoard[col][BOARD_SIZE - 1 - row] = rotatedBoard[row][col];
      }
    }
    rotatedBoard = newBoard;
  }

  return rotatedBoard;
}

export function moveBoard(board: Board, direction: Direction): { board: Board; score: number; changed: boolean } {
  let totalScore = 0;
  let changed = false;
  let newBoard = [...board.map(row => [...row])];

  // Rotate board to make all directions work as left movement
  let rotations = 0;
  switch (direction) {
    case 'right':
      rotations = 2;
      break;
    case 'down':
      rotations = 1;
      break;
    case 'up':
      rotations = 3;
      break;
    case 'left':
    default:
      rotations = 0;
      break;
  }

  // Rotate board
  newBoard = rotateBoard(newBoard, rotations);

  // Slide each row to the left
  const rowResults = newBoard.map(row => slideRow(row));
  newBoard = rowResults.map(result => result.cells);
  totalScore = rowResults.reduce((sum, result) => sum + result.score, 0);
  changed = rowResults.some(result => result.changed);

  // Rotate back
  newBoard = rotateBoard(newBoard, (4 - rotations) % 4);

  // Update tile positions
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const tile = newBoard[row][col];
      if (tile) {
        tile.row = row;
        tile.col = col;
      }
    }
  }

  return { board: newBoard, score: totalScore, changed };
}

export function checkGameOver(board: Board): boolean {
  // Check for empty cells
  if (getEmptyCells(board).length > 0) {
    return false;
  }

  // Check for possible merges
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const current = board[row][col];
      if (!current) continue;

      // Check right neighbor
      if (col < BOARD_SIZE - 1) {
        const right = board[row][col + 1];
        if (right && right.value === current.value) {
          return false;
        }
      }

      // Check bottom neighbor
      if (row < BOARD_SIZE - 1) {
        const bottom = board[row + 1][col];
        if (bottom && bottom.value === current.value) {
          return false;
        }
      }
    }
  }

  return true;
}

export function checkWin(board: Board): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const tile = board[row][col];
      if (tile && tile.value >= WIN_VALUE) {
        return true;
      }
    }
  }
  return false;
}

export function getCurrentScore(board: Board): number {
  let score = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const tile = board[row][col];
      if (tile) {
        // Score is sum of all tiles (or you could calculate differently)
        score += tile.value;
      }
    }
  }
  return score;
}