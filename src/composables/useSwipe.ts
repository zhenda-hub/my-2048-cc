import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import type { Direction } from '@/types/game.types';

interface UseSwipeOptions {
  threshold?: number; // Minimum distance to trigger swipe (px)
  onSwipe?: (direction: Direction) => void;
}

export function useSwipe(elementRef: Ref<HTMLElement | null>, options: UseSwipeOptions = {}) {
  const { threshold = 30, onSwipe } = options;

  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const touchEndX = ref(0);
  const touchEndY = ref(0);

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    touchStartX.value = touch.clientX;
    touchStartY.value = touch.clientY;
  };

  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    touchEndX.value = touch.clientX;
    touchEndY.value = touch.clientY;
  };

  const handleTouchEnd = () => {
    const dx = touchEndX.value - touchStartX.value;
    const dy = touchEndY.value - touchStartY.value;

    // Check if swipe distance exceeds threshold
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      return; // Not a significant swipe
    }

    let direction: Direction | null = null;

    // Determine primary direction based on larger component
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      direction = dx > 0 ? 'right' : 'left';
    } else {
      // Vertical swipe
      direction = dy > 0 ? 'down' : 'up';
    }

    if (direction && onSwipe) {
      onSwipe(direction);
    }

    // Reset values
    touchStartX.value = 0;
    touchStartY.value = 0;
    touchEndX.value = 0;
    touchEndY.value = 0;
  };

  onMounted(() => {
    const element = elementRef.value;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
    element.addEventListener('touchmove', handleTouchMove as EventListener, { passive: true });
    element.addEventListener('touchend', handleTouchEnd as EventListener);
  });

  onUnmounted(() => {
    const element = elementRef.value;
    if (!element) return;

    element.removeEventListener('touchstart', handleTouchStart as EventListener);
    element.removeEventListener('touchmove', handleTouchMove as EventListener);
    element.removeEventListener('touchend', handleTouchEnd as EventListener);
  });
}