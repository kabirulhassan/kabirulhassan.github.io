'use client';

import { useEffect, useState } from 'react';

/**
 * Normalized pointer position, -1..1 on each axis, relative to viewport
 * center. Skips entirely on touch-only devices and when reduced motion
 * is requested, since parallax is a desktop pointer affordance.
 */
export function usePointerParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchPrimary = window.matchMedia('(pointer: coarse)').matches;
    if (reducedMotion || isTouchPrimary) return;

    const handleMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setPos({ x, y });
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return pos;
}
