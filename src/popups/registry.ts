import MathEquation from "./math-equation";
import TicTacToe from "./tic-tac-toe";
import SimpleClose from "./simple-close";
import type { Popup } from "./types";
import OsuSpinner from "./osu-spinner";

// add new challenges here
export const popups: Popup[] = [
  { id: "simple-close", title: "Simple Close", Component: SimpleClose },
  { id: "tic-tac-toe", title: "Tic Tac Toe", Component: TicTacToe },
  { id: "math-equation", title: "Math Equation", Component: MathEquation },
  { id: "osu-spinner", title: "Osu Spinner", Component: OsuSpinner },
];
