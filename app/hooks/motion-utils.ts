/**
 * Momentum helpers from Apple's "Designing Fluid Interfaces" (WWDC 2018),
 * §6 (projection) and §9 (rubber-banding).
 */

/** Where a gesture released at `velocity` (units/s) would coast to. */
export function project(velocity: number, decelerationRate = 0.998) {
  return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
}

/** Progressive resistance past a boundary instead of a hard clamp. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/** Clamps `value` into [0, max], rubber-banding any overshoot past either edge. */
export function rubberbandClamp(value: number, max: number, constant = 0.55) {
  if (value < 0) return rubberband(value, max, constant);
  if (value > max) return max + rubberband(value - max, max, constant);
  return value;
}
