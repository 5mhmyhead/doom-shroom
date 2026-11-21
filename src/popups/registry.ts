import MathEquation from "./math-equation";
import TicTacToe from "./tic-tac-toe";
import type { Popup } from "./types";
import OsuSpinner from "./osu-spinner";

// add new challenges here
export const popups: Popup[] = [
  { id: "tic-tac-toe", title: "Tic Tac Toe", Component: TicTacToe },
  { id: "math-equation", title: "Math Equation", Component: MathEquation },
  { id: "osu-spinner", title: "Osu Spinner", Component: OsuSpinner },
];
