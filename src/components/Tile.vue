<template>
  <div
    class="tile"
    :class="[`tile-${tile.value}`, { 'tile-large': tile.value >= 1000 }]"
    :style="tileStyle"
  >
    <span class="tile-value">{{ tile.value }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Tile } from '@/types/game.types';
import { TILE_COLORS, TEXT_COLORS } from '@/utils/constants';

interface Props {
  tile: Tile;
}

const props = defineProps<Props>();

const tileStyle = computed(() => ({
  backgroundColor: TILE_COLORS[props.tile.value] || '#cdc1b4',
  color: TEXT_COLORS[props.tile.value] || '#776e65',
}));
</script>

<style scoped>
.tile {
  width: 100%;
  height: 100%;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 32px;
  transition: all 0.1s ease;
  user-select: none;
  position: absolute;
  top: 0;
  left: 0;
}

.tile-large {
  font-size: 24px;
}

.tile-value {
  display: block;
  text-align: center;
  line-height: 1;
}

/* Responsive font sizes */
@media (max-width: 480px) {
  .tile {
    font-size: 24px;
  }

  .tile-large {
    font-size: 18px;
  }
}

@media (max-width: 320px) {
  .tile {
    font-size: 20px;
  }

  .tile-large {
    font-size: 16px;
  }
}
</style>