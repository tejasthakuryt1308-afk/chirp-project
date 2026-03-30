import { useEffect } from 'react';

export const usePullToRefresh = () => {
  useEffect(() => {
    // Disabled to prevent mobile scroll bugs
    // and unwanted refresh issues in production
  }, []);

  return false;
};
