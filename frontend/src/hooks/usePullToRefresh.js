import { useEffect, useState } from 'react';

export const usePullToRefresh = (onRefresh) => {
  const [startY, setStartY] = useState(0);
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
        await onRefresh();
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

// Usage in your Home component:
const refreshFeed = async () => {
  showToast('Refreshing feed...', 'info');
  await fetchTweets();
  showToast('Feed refreshed!', 'success');
};

const pulling = usePullToRefresh(refreshFeed);

// Show indicator
{pulling && (
  <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
)}
