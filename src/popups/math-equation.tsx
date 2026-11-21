import { useEffect, useRef, useState } from "react";

import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { PopupProps } from "./types";

type Question = {
  equation: string;
  answers: string[];
  correct: string;
};

const QUESTION_BANK: Record<number, Question[]> = {
  1: [
    {
      equation: "8 + 6 × 2 = ?",
      answers: ["28", "20", "16", "14"],
      correct: "20",
    },
    {
      equation: "15 - 4 × 2 = ?",
      answers: ["22", "11", "7", "9"],
      correct: "7",
    },
  ],
  2: [
    {
      equation: "(24 ÷ 4) × 3 + 7 = ?",
      answers: ["25", "21", "27", "30"],
      correct: "25",
    },
    {
      equation: "48 ÷ (3 + 5) × 4 = ?",
      answers: ["20", "24", "18", "32"],
      correct: "24",
    },
  ],
  3: [
    {
      equation: "4x + 7 = 2x + 19",
      answers: ["8", "12", "6", "4"],
      correct: "6",
    },
    {
      equation: "5x - 8 = 2x + 13",
      answers: ["5", "7", "9", "6"],
      correct: "7",
    },
  ],
  4: [
    {
      equation: "3(2x - 4) + 5 = 2(x + 7) - 1",
      answers: ["5", "6", "8", "4"],
      correct: "5",
    },
    {
      equation: "4(x + 3) - 7 = 2(x + 8) + 1",
      answers: ["6", "8", "4", "10"],
      correct: "6",
    },
  ],
  5: [
    {
      equation: "(x² - 9)/(x - 3) = 8, x ≠ 3",
      answers: ["3", "8", "5", "11"],
      correct: "5",
    },
    {
      equation: "(x² - 16)/(x - 4) = 11, x ≠ 4",
      answers: ["4", "7", "11", "15"],
      correct: "7",
    },
  ],
};

const DIFFICULTY_ICONS = {
  1: require("../../assets/difficulty-faces/Normal_Icon.png"),
  2: require("../../assets/difficulty-faces/Hard_Icon.png"),
  3: require("../../assets/difficulty-faces/Insane_Icon.png"),
  4: require("../../assets/difficulty-faces/EasyDemon_Icon.png"),
  5: require("../../assets/difficulty-faces/EasyDemon_Icon.png"),
};

const getQuestion = (level: number, previous?: Question): Question => {
  const bank = QUESTION_BANK[level];

  const available = bank.filter((question) => question !== previous);

  const pool = available.length > 0 ? available : bank;

  return pool[Math.floor(Math.random() * pool.length)];
};

let currentMathLevel = 1;

const getCurrentLevel = () => currentMathLevel;

const advanceLevel = () => {
  currentMathLevel = currentMathLevel >= 5 ? 1 : currentMathLevel + 1;
};

export default function MathEquation({ onSolve }: PopupProps) {
  // Random level once when popup mounts
  const [currentLevel] = useState(getCurrentLevel);

  const [question, setQuestion] = useState<Question>(() =>
    getQuestion(currentLevel),
  );

  const [timeLeft, setTimeLeft] = useState(25);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [attempts, setAttempts] = useState(0);

  const locked = useRef(false);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPending = () => {
    if (pending.current !== null) {
      clearTimeout(pending.current);
      pending.current = null;
    }
  };

  useEffect(() => {
    return () => clearPending();
  }, []);

  const nextQuestion = () => {
    locked.current = false;

    setQuestion((previous) => getQuestion(currentLevel, previous));

    setSelected(null);
    setFeedback("");
    setTimeLeft(25);
    setAttempts((prev) => prev + 1);
  };

  const handleFailure = (message: string) => {
    if (locked.current) return;

    locked.current = true;
    setFeedback(message);

    clearPending();

    pending.current = setTimeout(() => {
      nextQuestion();
    }, 900);
  };

  useEffect(() => {
    if (locked.current) return;

    if (timeLeft <= 0) {
      handleFailure("TIME'S UP! NEW EQUATION...");
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, question]);

  const handleAnswer = (answer: string) => {
    if (locked.current || timeLeft <= 0) return;

    locked.current = true;
    setSelected(answer);

    clearPending();

    if (answer === question.correct) {
      setFeedback("CORRECT!");

      pending.current = setTimeout(() => {
        advanceLevel();
        onSolve();
      }, 900);
    } else {
      setFeedback("WRONG! NEW EQUATION...");

      pending.current = setTimeout(() => {
        nextQuestion();
      }, 900);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/fractal.gif")}
      style={s.background}
      imageStyle={s.backgroundImage}
      resizeMode="cover"
    >
      {/* FRACTAL CHALLENGE TITLE */}

      <View style={s.titleContainer}>
        <Text style={s.gameTitle}>Fractal Challenge</Text>

        <View style={s.difficultyRow}>
          <Image
            source={
              DIFFICULTY_ICONS[currentLevel as keyof typeof DIFFICULTY_ICONS]
            }
            style={s.difficultyIcon}
            resizeMode="contain"
          />

          <Text style={s.levelText}>Level {currentLevel}</Text>
        </View>
      </View>

      {/* MATH POPUP */}
      <View style={s.container}>
        <View style={s.popup}>
          <View style={s.header}>
            <Text style={s.headerTitle}>Solve this math equation</Text>

            <Text style={s.timer}>{timeLeft}s Left</Text>
          </View>

          <View style={s.equationBox}>
            <Text style={s.equationText}>{question.equation}</Text>
          </View>

          <View style={s.answers}>
            {question.answers.map((answer, index) => (
              <Pressable
                key={`${question.equation}-${index}`}
                disabled={locked.current || timeLeft <= 0}
                onPress={() => handleAnswer(answer)}
                style={[
                  s.answerButton,
                  {
                    transform: [
                      {
                        rotate: ["-12deg", "12deg", "8deg", "-8deg"][index],
                      },
                    ],
                  },
                  selected === answer && {
                    backgroundColor:
                      answer === question.correct ? "#61FF00" : "#FF4141",
                  },
                ]}
              >
                <Text style={s.answerText}>{answer}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={s.footerText}>
            {feedback || `Attempt ${attempts + 1}`}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  titleContainer: {
    position: "absolute",
    top: 25,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    zIndex: 10,
  },

  gameTitle: {
    color: "#FF00E5",
    fontFamily: "ComicNeue_700Bold",
    fontSize: 40,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  levelText: {
    color: "#FFFFFF",
    fontFamily: "ComicNeue_700Bold",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "right",
    marginTop: 2,
    marginRight: 8,
  },

  background: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#050014",
  },

  backgroundImage: {
    width: "100%",
    height: "100%",
  },

  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 18,
    paddingTop: 255,
  },

  popup: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#A000A8",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
    transform: [{ rotate: "-5deg" }],
    borderWidth: 1,
    borderColor: "#65006C",
  },

  difficultyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 2,
  },

  difficultyIcon: {
    width: 75,
    height: 75,
    transform: [{ rotate: "-12deg" }],
  },

  header: {
    backgroundColor: "#050505",
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontFamily: "ComicNeue_700Bold",
    fontSize: 20,
    fontWeight: "600",
    fontStyle: "italic",
  },
  timer: {
    color: "#FFFFFF",
    fontFamily: "ComicNeue_700Bold",
    fontSize: 12,
    textAlign: "right",
    fontWeight: "600",
  },
  equationBox: {
    backgroundColor: "#252035",
    marginTop: 12,
    minHeight: 35,
    paddingHorizontal: 6,
    paddingVertical: 6,
    justifyContent: "center",
  },
  equationText: {
    color: "#FFFFFF",
    fontFamily: "ComicNeue_700Bold",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  answers: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    columnGap: 12,
    rowGap: 16,
    marginTop: 18,
    marginBottom: 18,
  },
  answerButton: {
    width: "43%",
    height: 55,
    backgroundColor: "#C9C9C9",
    borderWidth: 2,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },
  answerText: {
    color: "#000000",
    fontFamily: "ComicNeue_700Bold",
    fontSize: 24,
    fontWeight: "800",
  },
  footerText: {
    color: "#5CFF00",
    fontFamily: "ComicNeue_700Bold",
    fontSize: 12,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
  },
});
