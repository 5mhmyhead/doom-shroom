import MathEquation from "./math-equation";
import TicTacToe from "./tic-tac-toe";
import type { Popup } from "./types";
import OsuSpinner from "./osu-spinner";
import XpRobot from "./xp-robot";
import HellCaptchaChallenge from "./hell-captcha";
import RunawayClose from "./runaway-close";

// add new challenges here
export const popups: Popup[] = [
  { id: "tic-tac-toe", title: "Tic Tac Toe", Component: TicTacToe },
  { id: "math-equation", title: "Math Equation", Component: MathEquation },
  { id: "osu-spinner", title: "Osu Spinner", Component: OsuSpinner },
  { id: "xp-robot", title: "XP Robot", Component: XpRobot },
  { id: "hell-captcha", title: "Hell Captcha", Component: HellCaptchaChallenge },
  { id: "runaway-close", title: "Runaway Close", Component: RunawayClose },
];
