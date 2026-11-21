import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { PopupProps } from "./types";

type Cell = "X" | "O" | null;

const RAINBOW_COLORS = [
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#00BFFF",
  "#8B00FF",
  "#FF00FF",
];

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // cols
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

const DIFFICULTY_FACES: Record<number, any> = {
  1: require("../../assets/difficulty-faces/Normal_Icon.png"),
  2: require("../../assets/difficulty-faces/Hard_Icon.png"),
  3: require("../../assets/difficulty-faces/Insane_Icon.png"),
  4: require("../../assets/difficulty-faces/EasyDemon_Icon.png"),
};

let currentTicTacToeLevel = 1;

const getCurrentLevel = () => currentTicTacToeLevel;

const advanceLevel = () => {
  currentTicTacToeLevel =
    currentTicTacToeLevel >= 4 ? 1 : currentTicTacToeLevel + 1;
};

const COMIC_FONT = "ComicNeue_700Bold";
const TURN_TIME_MS = 5000;

function checkWinner(board: Cell[]): Cell | "DRAW" | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.every((cell) => cell !== null) ? "DRAW" : null;
}

// Level 3 & 4: Win if possible, else block X, else random
function getSmartBotMove(board: Cell[]): number {
  const empty = board
    .map((val, i) => (val === null ? i : -1))
    .filter((i) => i !== -1);

  for (const target of ["O", "X"] as const) {
    for (const [a, b, c] of WIN_LINES) {
      const line = [board[a], board[b], board[c]];
      if (
        line.filter((v) => v === target).length === 2 &&
        line.includes(null)
      ) {
        if (board[a] === null) return a;
        if (board[b] === null) return b;
        if (board[c] === null) return c;
      }
    }
  }

  return empty[Math.floor(Math.random() * empty.length)];
}

// Level 3: Rotate 3x3 grid 90 degrees clockwise
function rotateBoardClockwise(board: Cell[]): Cell[] {
  return [
    board[6],
    board[3],
    board[0],
    board[7],
    board[4],
    board[1],
    board[8],
    board[5],
    board[2],
  ];
}

export default function TicTacToe({ onSolve }: PopupProps) {
  const [currentLevel] = useState(getCurrentLevel);

  const hasTimer = currentLevel === 2 || currentLevel === 4;
  const hasCenterTrap = currentLevel === 2;
  const hasSmartBot = currentLevel >= 3;
  const hasRotation = currentLevel === 3;
  const hasPieceDecay = currentLevel === 4;

  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [promptText, setPromptText] = useState("Beat a game of Tic-Tac-Toe");
  const [locked, setLocked] = useState(false);

  // Level 2 & 4: 5-second turn countdown
  const [timeLeftMs, setTimeLeftMs] = useState(TURN_TIME_MS);

  // Level 2: Fake confirmation dialog on center square
  const [confirmPopupVisible, setConfirmPopupVisible] = useState(false);

  // Level 4: Track placement order for max-3 piece decay
  const [xHistory, setXHistory] = useState<number[]>([]);
  const [oHistory, setOHistory] = useState<number[]>([]);

  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
    };
  }, []);

  const resetBoard = (msg: string) => {
    setPromptText(msg);
    setLocked(true);
    setConfirmPopupVisible(false);

    if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
    pendingTimeout.current = setTimeout(() => {
      setBoard(Array(9).fill(null));
      setXHistory([]);
      setOHistory([]);
      setTimeLeftMs(TURN_TIME_MS);
      setPromptText("Beat a game of Tic-Tac-Toe");
      setLocked(false);
    }, 800);
  };

  const triggerBotTurn = (
    currentBoard: Cell[],
    currentXHist: number[],
    currentOHist: number[],
    customStatus?: string,
  ) => {
    setLocked(true);
    if (customStatus) setPromptText(customStatus);

    pendingTimeout.current = setTimeout(() => {
      const empty = currentBoard
        .map((val, i) => (val === null ? i : -1))
        .filter((i) => i !== -1);

      if (empty.length === 0) {
        resetBoard("TIE! Try again...");
        return;
      }

      const botIdx = hasSmartBot
        ? getSmartBotMove(currentBoard)
        : empty[Math.floor(Math.random() * empty.length)];

      let next = [...currentBoard];
      let nextOHist = [...currentOHist];

      // Level 4: Bot also obeys max-3 piece decay
      if (hasPieceDecay && nextOHist.length >= 3) {
        const oldestO = nextOHist[0];
        next[oldestO] = null;
        nextOHist = nextOHist.slice(1);
      }

      next[botIdx] = "O";
      nextOHist.push(botIdx);

      // Level 3: Rotate board 90° clockwise after bot moves
      if (hasRotation) {
        next = rotateBoardClockwise(next);
      }

      setBoard(next);
      setOHistory(nextOHist);
      setXHistory(currentXHist);

      const botResult = checkWinner(next);
      if (botResult === "O") {
        resetBoard("YOU LOST! Resetting...");
      } else if (botResult === "DRAW") {
        resetBoard("TIE! Try again...");
      } else {
        setTimeLeftMs(TURN_TIME_MS);
        setPromptText(
          hasRotation
            ? "BOARD ROTATED! Your turn..."
            : "Beat a game of Tic-Tac-Toe",
        );
        setLocked(false);
      }
    }, 250);
  };

  // Level 2 & 4: 5-second turn clock (steals turn on timeout)
  useEffect(() => {
    if (!hasTimer || locked) return;

    const interval = setInterval(() => {
      setTimeLeftMs((prev) => {
        if (prev <= 100) {
          clearInterval(interval);
          setConfirmPopupVisible(false);
          triggerBotTurn(board, xHistory, oHistory, "TOO SLOW! Turn stolen!");
          return TURN_TIME_MS;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [hasTimer, locked, board, xHistory, oHistory]);

  const executePlayerMove = (index: number) => {
    if (locked || board[index] !== null) return;

    const next = [...board];
    let nextXHist = [...xHistory];

    // Level 4: Remove oldest X if player already has 3 marks
    if (hasPieceDecay && nextXHist.length >= 3) {
      const oldestX = nextXHist[0];
      next[oldestX] = null;
      nextXHist = nextXHist.slice(1);
    }

    next[index] = "X";
    nextXHist.push(index);

    setBoard(next);
    setXHistory(nextXHist);
    setTimeLeftMs(TURN_TIME_MS);

    const playerResult = checkWinner(next);
    if (playerResult === "X") {
      setPromptText("ACCESS GRANTED!");
      setLocked(true);
      pendingTimeout.current = setTimeout(() => {
        advanceLevel();
        onSolve();
      }, 400);
      return;
    }
    if (playerResult === "DRAW") {
      resetBoard("TIE! Try again...");
      return;
    }

    triggerBotTurn(next, nextXHist, oHistory);
  };

  const handleCellPress = (index: number) => {
    if (locked || board[index] !== null) return;

    // Level 2: Fake Win95 confirmation popup on center square
    if (hasCenterTrap && index === 4 && !confirmPopupVisible) {
      setConfirmPopupVisible(true);
      return;
    }

    executePlayerMove(index);
  };

  const confirmCenterMove = () => {
    setConfirmPopupVisible(false);
    executePlayerMove(4);
  };

  const handleFakeWindowControl = () => {
    resetBoard("NICE TRY! Win the game to close!");
  };

  const decayingXIndex =
    hasPieceDecay && xHistory.length === 3 ? xHistory[0] : -1;

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.windowOuter}>
        <View style={s.windowInner}>
          {/* Classic Navy Title Bar */}
          <View style={s.titleBar}>
            <Text style={s.titleBarText} numberOfLines={1}>
              Advertisement - DEV.EXE
            </Text>
            <View style={s.windowControls}>
              <Pressable onPress={handleFakeWindowControl} style={s.winBtn}>
                <Text style={s.winBtnText}>_</Text>
              </Pressable>
              <Pressable onPress={handleFakeWindowControl} style={s.winBtn}>
                <Text style={s.winBtnText}>□</Text>
              </Pressable>
              <Pressable onPress={handleFakeWindowControl} style={s.winBtn}>
                <Text style={s.winBtnText}>X</Text>
              </Pressable>
            </View>
          </View>

          {/* Black Level Banner */}
          <View style={s.levelBanner}>
            <Text style={s.levelBannerText}>
              Level {currentLevel} Security Check *****
            </Text>
          </View>

          {/* Difficulty Face Icon */}
          <Image
            source={DIFFICULTY_FACES[currentLevel] ?? DIFFICULTY_FACES[1]}
            style={s.difficultyFace}
            resizeMode="contain"
          />

          {/* Pale Yellow "Oh noes!11" Warning Box */}
          <View style={s.warningBox}>
            <Text style={s.ohNoesText}>Oh noes!11</Text>
            <View style={s.warningSubContainer}>
              <Text style={s.warningSubText}>You have been pwned!</Text>
              <Text style={s.warningSubText}>
                {currentLevel === 1 && "Complete this Challenge to unlock!!11"}
                {currentLevel === 2 && "5s turn clock! Watch out for popups!"}
                {currentLevel === 3 && "Smart bot + board rotates every turn!"}
                {currentLevel === 4 && "Max 3 marks! Oldest X vanishes!"}
              </Text>
            </View>
          </View>

          {/* Rainbow Pixel Divider */}
          <View style={s.rainbowBar}>
            {Array.from({ length: 21 }).map((_, idx) => (
              <View
                key={idx}
                style={[
                  s.rainbowSegment,
                  {
                    backgroundColor:
                      RAINBOW_COLORS[idx % RAINBOW_COLORS.length],
                  },
                ]}
              />
            ))}
          </View>

          {/* Navy Challenge Prompt Box */}
          <View style={s.promptBox}>
            <Text style={s.promptLabel}>Security Challenge:</Text>
            <Text style={s.promptTitle}>{promptText}</Text>
          </View>

          {/* Level 2 & 4: 5-Second Windows 95 Segmented Progress Bar */}
          {hasTimer && (
            <View style={s.timerContainer}>
              <Text style={s.timerLabel}>
                TURN TIME: {(timeLeftMs / 1000).toFixed(1)}s
              </Text>
              <View style={s.win95ProgressTrack}>
                {Array.from({ length: 10 }).map((_, blockIdx) => {
                  const threshold = ((blockIdx + 1) / 10) * TURN_TIME_MS;
                  const isFilled = timeLeftMs >= threshold - 250;
                  return (
                    <View
                      key={blockIdx}
                      style={[
                        s.win95ProgressBlock,
                        !isFilled && { backgroundColor: "transparent" },
                      ]}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* 3x3 Beveled Tic-Tac-Toe Grid + Level 2 Fake Dialog Overlay */}
          <View style={s.gridContainer}>
            {[0, 1, 2].map((row) => (
              <View key={row} style={s.gridRow}>
                {[0, 1, 2].map((col) => {
                  const idx = row * 3 + col;
                  const value = board[idx];
                  const isDecaying = idx === decayingXIndex;
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => handleCellPress(idx)}
                      style={({ pressed }) => [
                        s.cell,
                        pressed && value === null && s.cellPressed,
                        isDecaying && s.cellDecaying,
                      ]}
                    >
                      <Text
                        style={[s.cellText, isDecaying && { color: "#CC0000" }]}
                      >
                        {value ?? ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            {/* Level 2: Overlapping Fake Win95 Confirmation Box */}
            {hasCenterTrap && confirmPopupVisible && (
              <View style={s.fakeConfirmOverlay}>
                <View style={s.fakeConfirmTitleBar}>
                  <Text style={s.fakeConfirmTitle}>Confirm Move</Text>
                  <Pressable
                    onPress={() => setConfirmPopupVisible(false)}
                    style={s.fakeMiniCloseBtn}
                  >
                    <Text style={s.fakeMiniCloseText}>X</Text>
                  </Pressable>
                </View>

                <View style={s.fakeConfirmBody}>
                  <Text style={s.fakeConfirmText}>
                    Are you sure you want to place X here?
                  </Text>
                  <View style={s.fakeConfirmButtons}>
                    <Pressable
                      onPress={confirmCenterMove}
                      style={s.win95SmallBtn}
                    >
                      <Text style={s.win95SmallBtnText}>Yes</Text>
                    </Pressable>
                    <Pressable
                      onPress={confirmCenterMove}
                      style={s.win95SmallBtn}
                    >
                      <Text style={s.win95SmallBtnText}>Definitely</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: "center",
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 8,
    paddingBottom: 12,
  },
  windowOuter: {
    backgroundColor: "#C0C0C0",
    marginHorizontal: 18,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#000000",
    borderRightColor: "#000000",
  },
  windowInner: {
    padding: 8,
    paddingBottom: 14,
    gap: 6,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: "#DFDFDF",
    borderLeftColor: "#DFDFDF",
    borderBottomColor: "#808080",
    borderRightColor: "#808080",
  },
  titleBar: {
    backgroundColor: "#000080",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  titleBarText: {
    color: "#FFFFFF",
    fontFamily: COMIC_FONT,
    fontSize: 13,
    flex: 1,
  },
  windowControls: {
    flexDirection: "row",
    gap: 3,
  },
  winBtn: {
    width: 22,
    height: 20,
    backgroundColor: "#C0C0C0",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#000000",
    borderRightColor: "#000000",
  },
  winBtnText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 14,
  },
  levelBanner: {
    backgroundColor: "#000000",
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  levelBannerText: {
    color: "#55FF55",
    fontFamily: COMIC_FONT,
    fontSize: 13,
  },
  difficultyFace: {
    width: 58,
    height: 58,
    alignSelf: "center",
    marginVertical: 2,
  },
  warningBox: {
    backgroundColor: "#FFFFC8",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#808080",
  },
  ohNoesText: {
    fontFamily: COMIC_FONT,
    fontSize: 24,
    color: "#000000",
    transform: [{ rotate: "-3deg" }],
    alignSelf: "flex-start",
    marginBottom: 2,
  },
  warningSubContainer: {
    paddingLeft: 44,
  },
  warningSubText: {
    fontFamily: COMIC_FONT,
    fontSize: 12,
    color: "#000000",
    lineHeight: 15,
  },
  rainbowBar: {
    flexDirection: "row",
    height: 5,
    width: "100%",
  },
  rainbowSegment: {
    flex: 1,
    height: "100%",
  },
  promptBox: {
    backgroundColor: "#000080",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 2,
  },
  promptLabel: {
    color: "#FFFF55",
    fontFamily: COMIC_FONT,
    fontSize: 12,
  },
  promptTitle: {
    color: "#FFFFFF",
    fontFamily: COMIC_FONT,
    fontSize: 16,
  },
  timerContainer: {
    padding: 4,
    backgroundColor: "#C0C0C0",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
  },
  timerLabel: {
    fontFamily: COMIC_FONT,
    fontSize: 11,
    color: "#000000",
    marginBottom: 2,
  },
  win95ProgressTrack: {
    flexDirection: "row",
    height: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#808080",
    padding: 2,
    gap: 2,
  },
  win95ProgressBlock: {
    flex: 1,
    backgroundColor: "#000080",
  },
  gridContainer: {
    position: "relative",
    backgroundColor: "#000000",
    padding: 3,
    gap: 3,
    aspectRatio: 1,
    width: "84%",
    alignSelf: "center",
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
    gap: 3,
  },
  cell: {
    flex: 1,
    backgroundColor: "#C0C0C0",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#404040",
    borderRightColor: "#404040",
  },
  cellPressed: {
    borderTopColor: "#404040",
    borderLeftColor: "#404040",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    backgroundColor: "#B0B0B0",
  },
  cellDecaying: {
    backgroundColor: "#FFD6D6",
  },
  cellText: {
    fontFamily: COMIC_FONT,
    fontSize: 32,
    color: "#000000",
  },
  fakeConfirmOverlay: {
    position: "absolute",
    top: "22%",
    left: "6%",
    right: "6%",
    backgroundColor: "#C0C0C0",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#000000",
    borderRightColor: "#000000",
    elevation: 8,
    zIndex: 20,
  },
  fakeConfirmTitleBar: {
    backgroundColor: "#000080",
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fakeConfirmTitle: {
    color: "#FFFFFF",
    fontFamily: COMIC_FONT,
    fontSize: 11,
  },
  fakeMiniCloseBtn: {
    backgroundColor: "#C0C0C0",
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#000000",
    borderRightColor: "#000000",
  },
  fakeMiniCloseText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
  },
  fakeConfirmBody: {
    padding: 10,
    alignItems: "center",
  },
  fakeConfirmText: {
    fontFamily: COMIC_FONT,
    fontSize: 12,
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  fakeConfirmButtons: {
    flexDirection: "row",
    gap: 10,
  },
  win95SmallBtn: {
    backgroundColor: "#C0C0C0",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#000000",
    borderRightColor: "#000000",
  },
  win95SmallBtnText: {
    fontFamily: COMIC_FONT,
    fontSize: 12,
    color: "#000000",
  },
});
