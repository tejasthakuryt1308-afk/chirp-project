import { useEffect, useRef, useState } from 'react';

export const usePullToRefresh = (onRefresh) => {
  const [pulling, setPulling] = useState(false);
  const [distance, setDistance] = useState(0);
  const startY = useRef(0);
  const active = useRef(false);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouch) return;

    const getScrollTop = () => window.scrollY || document.documentElement.scrollTop;

    const onStart = (e) => {
      if (getScrollTop() !== 0) return;
      active.current = true;
      startY.current = e.touches[0].clientY;
      setPulling(true);
    };

    const onMove = (e) => {
      if (!active.current) return;
      const delta = Math.max(0, e.touches[0].clientY - startY.current);
      setDistance(Math.min(120, delta));
    };

    const onEnd = async () => {
      if (!active.current) return;
      if (distance > 80 && onRefresh) await onRefresh();
      active.current = false;
      setPulling(false);
      setDistance(0);
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [distance, onRefresh]);

  return { pulling, distance };
};
