import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FPS } from "./theme";
export const useT = () => useCurrentFrame() / FPS;
const ease = Easing.bezier(0.33, 0, 0.2, 1);
export const prog = (t: number, a: number, d: number, e = ease) =>
  interpolate(t, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
