import { useEffect } from 'react';

export const usePullToRefresh = (onRefresh) => {
  useEffect(() => {
    let startY = 0;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const endY = e.changedTouches[0].clientY;

      if (endY - startY > 100) {
        onRefresh();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh]);
};
