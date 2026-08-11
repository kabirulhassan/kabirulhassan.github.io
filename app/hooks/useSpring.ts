'use client';

import { useEffect, useState } from 'react';
import { useMotionValue, useSpring as useMotionSpring, useMotionValueEvent } from 'motion/react';

export interface SpringConfig {
  damping?: number; // damping ratio: 1 = critically damped, <1 = bouncy
  response?: number; // seconds to settle, lower = snappier
}

/**
 * Thin wrapper over motion's spring, keeping the damping-ratio/response
 * parameter model from Apple's "Designing Fluid Interfaces" that the rest
 * of the app is tuned against. motion maps damping->bounce and
 * response->visualDuration, and carries velocity through retargets for
 * free — no hand-rolled rAF loop needed.
 */
export function useSpring(target: number, { damping = 1, response = 0.4 }: SpringConfig = {}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const motionTarget = useMotionValue(target);

  useEffect(() => {
    motionTarget.set(target);
  }, [target, motionTarget]);

  const spring = useMotionSpring(motionTarget, {
    visualDuration: response,
    bounce: Math.max(0, 1 - damping),
  });

  const [value, setValue] = useState(spring.get());
  useMotionValueEvent(spring, 'change', setValue);

  return reducedMotion ? target : value;
}
