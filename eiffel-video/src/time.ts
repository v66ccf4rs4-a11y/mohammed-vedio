import { useCurrentFrame, Easing, interpolate } from "remotion";
import { FPS } from "./theme";

/** Absolute timeline time in seconds (matches the voice transcript). */
export const useT = () => useCurrentFrame() / FPS;

const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Eased 0..1 progress of an animation starting at `start` lasting `dur` seconds. */
export const prog = (t: number, start: number, dur = 0.7, easing = ease) =>
  interpolate(t, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Overshooting pop 0..~1.08..1 */
export const pop = (t: number, start: number, dur = 0.6) =>
  prog(t, start, dur, Easing.bezier(0.34, 1.56, 0.64, 1));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
