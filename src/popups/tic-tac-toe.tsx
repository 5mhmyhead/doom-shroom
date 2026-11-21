import React, { useState } from "react";
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
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const DIFFICULTY_FACES: Record<number, any> = {
  1: require("../../assets/difficulty faces/Normal_Icon.png"),
  2: require("../../assets/difficulty faces/Normal_Icon.png"),
  3: require("../../assets/difficulty faces/Normal_Icon.png"),
  4: require("../../assets/difficulty faces/Normal_Icon.png"),
};

const COMIC_FONT = "ComicNeue_700Bold";

function checkWinner(board: Cell[]): Cell | "DRAW" | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.every((cell) => cell !== null) ? "DRAW" : null;
}

export default function TicTacToe({ onSolve, level }: PopupProps) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [promptText, setPromptText] = useState("Beat a game of Tic-Tac-Toe");
  const [locked, setLocked] = useState(false);

  const resetBoard = (msg: string) => {
    setPromptText(msg);
    setLocked(true);
    setTimeout(() => {
      setBoard(Array(9).fill(null));
      setPromptText("Beat a game of Tic-Tac-Toe");
      setLocked(false);
    }, 800);
  };

  const handleCellPress = (index: number) => {
    if (locked || board[index] !== null) return;

    // 1. Player places "X"
    const next = [...board];
    next[index] = "X";
    setBoard(next);

    const playerResult = checkWinner(next);
    if (playerResult === "X") {
      setPromptText("ACCESS GRANTED!");
      setLocked(true);
      setTimeout(() => onSolve(), 400);
      return;
    }
    if (playerResult === "DRAW") {
      resetBoard("TIE! Try again...");
      return;
    }

    // 2. Basic Level 1 random "O" move
    setLocked(true);
    setTimeout(() => {
      const empty = next
        .map((val, i) => (val === null ? i : -1))
        .filter((i) => i !== -1);
      const randomIdx = empty[Math.floor(Math.random() * empty.length)];
      next[randomIdx] = "O";
      setBoard([...next]);

      const botResult = checkWinner(next);
      if (botResult === "O") {
        resetBoard("YOU LOST! Resetting...");
      } else if (botResult === "DRAW") {
        resetBoard("TIE! Try again...");
      } else {
        setLocked(false);
      }
    }, 250);
  };

  const handleFakeWindowControl = () => {
    resetBoard("NICE TRY! Win the game to close!");
  };

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
              Level {level + 1} Security Check *****
            </Text>
          </View>

          {/* Difficulty Face Icon */}
          <Image
            source={DIFFICULTY_FACES[level + 1] ?? DIFFICULTY_FACES[1]}
            style={s.difficultyFace}
            resizeMode="contain"
          />

          {/* Pale Yellow "Oh noes!11" Warning Box */}
          <View style={s.warningBox}>
            <Text style={s.ohNoesText}>Oh noes!11</Text>
            <View style={s.warningSubContainer}>
              <Text style={s.warningSubText}>You have been pwned!</Text>
              <Text style={s.warningSubText}>
                Complete this Challenge to unlock!!11
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

          {/* 3x3 Beveled Tic-Tac-Toe Grid */}
          <View style={s.gridContainer}>
            {[0, 1, 2].map((row) => (
              <View key={row} style={s.gridRow}>
                {[0, 1, 2].map((col) => {
                  const idx = row * 3 + col;
                  const value = board[idx];
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => handleCellPress(idx)}
                      style={({ pressed }) => [
                        s.cell,
                        pressed && value === null && s.cellPressed,
                      ]}
                    >
                      <Text style={s.cellText}>{value ?? ""}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
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
  gridContainer: {
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
  cellText: {
    fontFamily: COMIC_FONT,
    fontSize: 32,
    color: "#000000",
  },
});
