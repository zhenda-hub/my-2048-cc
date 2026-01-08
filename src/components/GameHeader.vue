<template>
  <div class="game-header">
    <div class="title-section">
      <h1 class="game-title">2048</h1>
      <p class="game-subtitle">Combine tiles to get to 2048!</p>
    </div>

    <div class="scores-section">
      <div class="score-container">
        <div class="score-label">SCORE</div>
        <div class="score-value">{{ score }}</div>
      </div>

      <div class="score-container">
        <div class="score-label">BEST</div>
        <div class="score-value">{{ bestScore }}</div>
      </div>

      <div class="score-container" v-if="highestTile > 0">
        <div class="score-label">HIGHEST</div>
        <div class="score-value">{{ highestTile }}</div>
      </div>
    </div>

    <div class="controls-section">
      <div class="moves-counter">
        Moves: {{ moves }}
      </div>
      <button class="restart-btn" @click="onRestart">
        {{ gameStatus === 'playing' ? 'New Game' : 'Try Again' }}
      </button>
      <button class="undo-btn" @click="onUndo" :disabled="!canUndo">
        Undo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameStatus } from '@/types/game.types';

interface Props {
  score: number;
  bestScore: number;
  highestTile: number;
  moves: number;
  gameStatus: GameStatus;
  canUndo: boolean;
}

interface Emits {
  (e: 'restart'): void;
  (e: 'undo'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const onRestart = () => {
  emit('restart');
};

const onUndo = () => {
  emit('undo');
};
</script>

<style scoped>
.game-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.title-section {
  flex: 1;
  min-width: 200px;
}

.game-title {
  font-size: 60px;
  font-weight: bold;
  color: #776e65;
  margin: 0;
  line-height: 1;
}

.game-subtitle {
  color: #776e65;
  margin: 5px 0 0 0;
  font-size: 14px;
}

.scores-section {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.score-container {
  background-color: #bbada0;
  color: white;
  padding: 10px 15px;
  border-radius: 3px;
  text-align: center;
  min-width: 80px;
}

.score-label {
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  opacity: 0.8;
}

.score-value {
  font-size: 22px;
  font-weight: bold;
  margin-top: 2px;
}

.controls-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.moves-counter {
  color: #776e65;
  font-size: 14px;
  font-weight: bold;
}

.restart-btn,
.undo-btn {
  background-color: #8f7a66;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 120px;
}

.restart-btn:hover,
.undo-btn:hover:not(:disabled) {
  background-color: #7c6b5a;
}

.undo-btn:disabled {
  background-color: #d8d4d0;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Responsive design */
@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .title-section {
    text-align: center;
  }

  .game-title {
    font-size: 48px;
  }

  .scores-section {
    justify-content: center;
  }

  .controls-section {
    align-items: stretch;
  }

  .restart-btn,
  .undo-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 36px;
  }

  .score-container {
    min-width: 70px;
    padding: 8px 12px;
  }

  .score-value {
    font-size: 18px;
  }
}
</style>