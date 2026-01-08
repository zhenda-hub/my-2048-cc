<template>
  <div class="game-board">
    <div class="grid">
      <div
        v-for="row in BOARD_SIZE"
        :key="`row-${row}`"
        class="row"
      >
        <div
          v-for="col in BOARD_SIZE"
          :key="`cell-${row}-${col}`"
          class="cell"
          :class="{
            'new-tile': isNewTile(row - 1, col - 1),
            'merged-tile': isMergedTile(row - 1, col - 1)
          }"
        >
          <Tile
            v-if="board[row - 1][col - 1]"
            :tile="board[row - 1][col - 1]!"
            @click="handleTileClick(row - 1, col - 1)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Board } from '@/types/game.types';
import { BOARD_SIZE } from '@/utils/constants';
import Tile from './Tile.vue';

interface Props {
  board: Board;
  lastGeneratedTile?: { row: number; col: number; value: number } | null;
}

const props = defineProps<Props>();

const isNewTile = computed(() => (row: number, col: number) => {
  if (!props.lastGeneratedTile) return false;
  return row === props.lastGeneratedTile.row && col === props.lastGeneratedTile.col;
});

const isMergedTile = computed(() => (row: number, col: number) => {
  const tile = props.board[row][col];
  return tile?.mergedFrom !== undefined;
});

const handleTileClick = (row: number, col: number) => {
  const tile = props.board[row][col];
  if (tile) {
    console.log(`Tile clicked: ${tile.value} at (${row}, ${col})`);
    // You could add tile interaction logic here
  }
};
</script>

<style scoped>
.game-board {
  background-color: #bbada0;
  border-radius: 6px;
  padding: 10px;
  position: relative;
  touch-action: none; /* Prevent scrolling on mobile */
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row {
  display: flex;
  gap: 10px;
}

.cell {
  width: 80px;
  height: 80px;
  background-color: rgba(238, 228, 218, 0.35);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cell.new-tile {
  animation: appear 0.2s ease;
}

.cell.merged-tile {
  animation: pop 0.2s ease;
}

@keyframes appear {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive design */
@media (max-width: 480px) {
  .cell {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 320px) {
  .cell {
    width: 50px;
    height: 50px;
  }
}
</style>