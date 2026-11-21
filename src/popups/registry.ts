import MathEquation from "./math-equation";
import SimpleClose from "./simple-close";
import type { Popup } from "./types";

// add new challenges here
export const popups: Popup[] = [
  { id: "simple-close", title: "Simple Close", Component: SimpleClose },
  { id: "math-equation", title: "Math Equation", Component: MathEquation },
];
