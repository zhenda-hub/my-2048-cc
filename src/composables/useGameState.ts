import { ref, reactive, computed } from 'vue';
import type { Board, Direction, GameState, GameStatus } from '@/types/game.types';
import {
  initializeGame,
  addRandomTile,
  moveBoard,
  checkGameOver,
  checkWin,
  getCurrentScore,
  getEmptyCells,
} from '@/utils/gameHelpers';
import { WIN_VALUE } from '@/utils/constants';

export function useGameState() {
  // Reactive game state
  const board = ref<Board>(initializeGame());
  const score = ref(0);
  const gameOver = ref(false);
  const won = ref(false);
  const moves = ref(0);
  const lastMove = ref<Direction>();
  const lastGeneratedTile = ref<{ row: number; col: number; value: number } | null>(null);

  // Computed properties
  const gameStatus = computed<GameStatus>(() => {
    if (won.value) return 'won';
    if (gameOver.value) return 'lost';
    return 'playing';
  });

  const emptyCellsCount = computed(() => getEmptyCells(board.value).length);

  const highestTile = computed(() => {
    let max = 0;
    for (let row = 0; row < board.value.length; row++) {
      for (let col = 0; col < board.value[row].length; col++) {
        const tile = board.value[row][col];
        if (tile && tile.value > max) {
          max = tile.value;
        }
      }
    }
    return max;
  });

  // Game actions
  function move(direction: Direction) {
    if (gameOver.value || won.value) return false;

    const result = moveBoard(board.value, direction);

    if (!result.changed) {
      return false;
    }

    board.value = result.board;
    score.value += result.score;
    moves.value++;
    lastMove.value = direction;

    // Check for win
    if (!won.value && checkWin(board.value)) {
      won.value = true;
    }

    // Add new tile
    const addResult = addRandomTile(board.value);
    board.value = addResult.board;

    if (addResult.tile) {
      lastGeneratedTile.value = {
        row: addResult.tile.row,
        col: addResult.tile.col,
        value: addResult.tile.value,
      };
    }

    // Check for game over
    if (!gameOver.value && checkGameOver(board.value)) {
      gameOver.value = true;
    }

    return true;
  }

  function restart() {
    board.value = initializeGame();
    score.value = 0;
    gameOver.value = false;
    won.value = false;
    moves.value = 0;
    lastMove.value = undefined;
    lastGeneratedTile.value = null;
  }

  function resetGame() {
    restart();
  }

  function newGame() {
    restart();
  }

  // Keyboard event handler
  function handleKeydown(event: KeyboardEvent) {
    if (gameOver.value && won.value) return;

    let direction: Direction | null = null;

    switch (event.key) {
      case 'ArrowUp':
        direction = 'up';
        break;
      case 'ArrowDown':
        direction = 'down';
        break;
      case 'ArrowLeft':
        direction = 'left';
        break;
      case 'ArrowRight':
        direction = 'right';
        break;
      default:
        return;
    }

    if (direction) {
      event.preventDefault();
      move(direction);
    }
  }

  // Initialize
  score.value = getCurrentScore(board.value);
  gameOver.value = checkGameOver(board.value);
  won.value = checkWin(board.value);

  return {
    // State
    board,
    score,
    gameOver,
    won,
    moves,
    lastMove,
    lastGeneratedTile,

    // Computed
    gameStatus,
    emptyCellsCount,
    highestTile,

    // Actions
    move,
    restart,
    resetGame,
    newGame,
    handleKeydown,
  };
}

export type GameStateAPI = ReturnType<typeof useGameState>;