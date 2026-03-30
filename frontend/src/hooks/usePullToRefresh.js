import { useEffect, useState } from 'react';

export const usePullToRefresh = (onRefresh) => {
  const [pulling, setPulling] = useState(false);

  useEffect(() => {
    let startY = 0;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (window.scrollY === 0) {
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 80) {
          setPulling(true);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pulling) {
        setPulling(false);
        if (onRefresh) {
          await onRefresh();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pulling, onRefresh]);

  return pulling;
};
