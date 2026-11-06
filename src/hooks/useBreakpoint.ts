import { useEffect, useState } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const TABLET_MIN_WIDTH = '(min-width: 640px)';
const DESKTOP_MIN_WIDTH = '(min-width: 1024px)';

const getBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'desktop';
  if (window.matchMedia(DESKTOP_MIN_WIDTH).matches) return 'desktop';
  if (window.matchMedia(TABLET_MIN_WIDTH).matches) return 'tablet';
  return 'mobile';
};

export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const queries = [window.matchMedia(TABLET_MIN_WIDTH), window.matchMedia(DESKTOP_MIN_WIDTH)];
    const update = () => setBreakpoint(getBreakpoint());
    queries.forEach((query) => query.addEventListener('change', update));
    update();
    return () => queries.forEach((query) => query.removeEventListener('change', update));
  }, []);

  return breakpoint;
};
