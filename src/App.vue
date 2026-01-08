<template>
  <div id="app">
    <div class="container">
      <GameHeader
        :score="score"
        :best-score="bestScore"
        :highest-tile="highestTile"
        :moves="moves"
        :game-status="gameStatus"
        :can-undo="false"
        @restart="restart"
        @undo="handleUndo"
      />

      <div class="game-container">
        <div
          ref="gameBoardRef"
          class="game-area"
          @keydown="handleKeydown"
          tabindex="0"
        >
          <div class="game-status-message" v-if="gameStatus !== 'playing'">
            <div v-if="gameStatus === 'won'" class="message won">
              <h2>You Win!</h2>
              <p>You reached 2048! Keep playing to get a higher score.</p>
              <button @click="continuePlaying" class="continue-btn">
                Continue Playing
              </button>
            </div>
            <div v-if="gameStatus === 'lost'" class="message lost">
              <h2>Game Over!</h2>
              <p>No more moves available.</p>
            </div>
          </div>

          <GameBoard
            :board="board"
            :last-generated-tile="lastGeneratedTile"
          />

          <div class="instructions">
            <p><strong>How to play:</strong> Use your <strong>arrow keys</strong> or <strong>swipe</strong> to move the tiles.</p>
            <p>When two tiles with the same number touch, they merge into one!</p>
          </div>
        </div>

        <div class="mobile-controls" v-if="isMobile">
          <div class="direction-buttons">
            <button class="dir-btn up" @click="gameMove('up')">↑</button>
            <div class="horizontal-buttons">
              <button class="dir-btn left" @click="gameMove('left')">←</button>
              <button class="dir-btn down" @click="gameMove('down')">↓</button>
              <button class="dir-btn right" @click="gameMove('right')">→</button>
            </div>
          </div>
        </div>
      </div>

      <div class="game-info">
        <div class="stats">
          <div class="stat">
            <span class="stat-label">Empty Cells:</span>
            <span class="stat-value">{{ emptyCellsCount }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Last Move:</span>
            <span class="stat-value">{{ lastMove || 'None' }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Status:</span>
            <span class="stat-value">{{ gameStatus.toUpperCase() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useGameState } from '@/composables/useGameState';
import { useSwipe } from '@/composables/useSwipe';
import GameHeader from '@/components/GameHeader.vue';
import GameBoard from '@/components/GameBoard.vue';
import type { Direction } from '@/types/game.types';

// Game state
const {
  board,
  score,
  gameOver,
  won,
  moves,
  lastMove,
  lastGeneratedTile,
  gameStatus,
  emptyCellsCount,
  highestTile,
  move: gameMove,
  restart,
  handleKeydown,
} = useGameState();

// Best score persistence
const bestScore = ref(0);

// Load best score from localStorage
const loadBestScore = () => {
  const saved = localStorage.getItem('2048-best-score');
  if (saved) {
    bestScore.value = parseInt(saved, 10);
  }
};

// Save best score to localStorage
const saveBestScore = () => {
  if (score.value > bestScore.value) {
    bestScore.value = score.value;
    localStorage.setItem('2048-best-score', score.value.toString());
  }
};

// Watch score changes to update best score
watch(score, () => {
  saveBestScore();
});

// Mobile detection
const isMobile = ref(false);
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Game board ref for swipe detection
const gameBoardRef = ref<HTMLElement | null>(null);

// Swipe handling
useSwipe(gameBoardRef, {
  threshold: 30,
  onSwipe: (direction: Direction) => {
    gameMove(direction);
  },
});


// Continue playing after win
const continuePlaying = () => {
  // In a real implementation, you would set won.value = false
  // For now, we'll just reset the game
  restart();
};

// Undo functionality (stub)
const handleUndo = () => {
  // TODO: Implement undo functionality
  console.log('Undo requested');
};

// Initialize
onMounted(() => {
  loadBestScore();
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);

  // Focus game area for keyboard input
  if (gameBoardRef.value) {
    gameBoardRef.value.focus();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile);
});
</script>

<style>
#app {
  font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #776e65;
  min-height: 100vh;
  background-color: #faf8ef;
  padding: 20px;
  box-sizing: border-box;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.game-container {
  position: relative;
  margin-bottom: 30px;
}

.game-area {
  outline: none; /* Remove focus outline */
}

.game-area:focus {
  outline: 2px solid #8f7a66;
  border-radius: 6px;
}

.game-status-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 6px;
}

.message {
  text-align: center;
  padding: 30px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 400px;
}

.message h2 {
  margin: 0 0 15px 0;
  color: #776e65;
}

.message.won h2 {
  color: #5eda92;
}

.message.lost h2 {
  color: #f65e3b;
}

.message p {
  margin: 0 0 20px 0;
  color: #776e65;
}

.continue-btn {
  background-color: #8f7a66;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.continue-btn:hover {
  background-color: #7c6b5a;
}

.instructions {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0e8df;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
}

.instructions p {
  margin: 5px 0;
}

.mobile-controls {
  margin-top: 20px;
  display: none;
}

.direction-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.horizontal-buttons {
  display: flex;
  gap: 10px;
}

.dir-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background-color: #8f7a66;
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  user-select: none;
}

.dir-btn:hover {
  background-color: #7c6b5a;
}

.dir-btn.up {
  order: -1;
}

.game-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0e8df;
  border-radius: 6px;
}

.stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 15px;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  opacity: 0.8;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
}

/* Responsive design */
@media (max-width: 768px) {
  #app {
    padding: 10px;
  }

  .mobile-controls {
    display: block;
  }

  .game-status-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 400px;
    z-index: 1000;
  }

  .message {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 36px;
  }

  .dir-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .stats {
    flex-direction: column;
    gap: 10px;
  }
}
</style>