import SimpleClose from "./simple-close";
import TicTacToe from "./tic-tac-toe";
import type { Popup } from "./types";

// add new challenges here
export const popups: Popup[] = [
  { id: "simple-close", title: "Simple Close", Component: SimpleClose },
  { id: "tic-tac-toe", title: "Tic Tac Toe", Component: TicTacToe },
];
