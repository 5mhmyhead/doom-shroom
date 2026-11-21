import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { PopupProps } from "./types";
import { useRef, useEffect, useMemo, useState } from "react";
import type { ComponentRef } from "react";

const LEVELS = [
  { turns: 6, drain: 25, switchMs: 0 },
  { turns: 9, drain: 30, switchMs: 4000 },
  { turns: 12, drain: 35, switchMs: 2500 },
  { turns: 15, drain: 40, switchMs: 1000 },
];
const FACES = [
  require("../../assets/difficulty-faces/Normal_Icon.png"),
  require("../../assets/difficulty-faces/Hard_Icon.png"),
  require("../../assets/difficulty-faces/Insane_Icon.png"),
  require("../../assets/difficulty-faces/EasyDemon_Icon.png"),
];
const MAX_LEVEL = LEVELS.length;
const WRONG_PENALTY = 2;
const SWITCH_GRACE_MS = 150;

const IDLE_MS = 120;

export default function OsuSpinner({ onSolve, level }: PopupProps) {
  const idx = Math.min(Math.max(Math.round(level), 0), MAX_LEVEL - 1);
  const cfg = LEVELS[idx];
  const directional = cfg.switchMs > 0;

  const fillPerDegree = 100 / (cfg.turns * 360);
  const drain = cfg.drain;

  const dirRef = useRef<0 | 1 | -1>(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const lastSwitchAt = useRef(0);

  const rotation = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progress = useRef(0);
  const rotationDeg = useRef(0);
  const lastSpinAt = useRef(0);
  const done = useRef(false);

  const wheelRef = useRef<ComponentRef<typeof View>>(null);
  const center = useRef<{ x: number; y: number } | null>(null);
  const lastAngle = useRef<number | null>(null);

  const fillRef = useRef(fillPerDegree);
  fillRef.current = fillPerDegree;
  const drainRef = useRef(drain);
  drainRef.current = drain;
  const onSolveRef = useRef(onSolve);
  onSolveRef.current = onSolve;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,

        onPanResponderGrant: () => {
          lastAngle.current = null;
          wheelRef.current?.measureInWindow((x, y, w, h) => {
            center.current = { x: x + w / 2, y: y + h / 2 };
          });
        },

        onPanResponderMove: (_, g) => {
          if (done.current || !center.current) return;

          const angle =
            (Math.atan2(
              g.moveY - center.current.y,
              g.moveX - center.current.x,
            ) *
              180) /
            Math.PI;

          if (lastAngle.current === null) {
            lastAngle.current = angle;
            return;
          }

          let delta = angle - lastAngle.current;
          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;
          lastAngle.current = angle;

          if (delta === 0) return;

          rotationDeg.current += delta;
          rotation.setValue(rotationDeg.current);

          const need = dirRef.current;
          const inGrace = Date.now() - lastSwitchAt.current < SWITCH_GRACE_MS;
          const correct = need === 0 || inGrace || Math.sign(delta) === need;
          if (!correct) {
            progress.current = Math.max(
              0,
              progress.current -
                Math.abs(delta) * fillRef.current * WRONG_PENALTY,
            );
            return;
          }

          lastSpinAt.current = Date.now();
          progress.current = Math.min(
            100,
            progress.current + Math.abs(delta) * fillRef.current,
          );
        },

        onPanResponderRelease: () => {
          lastAngle.current = null;
        },
        onPanResponderTerminate: () => {
          lastAngle.current = null;
        },
      }),
    [rotation],
  );

  useEffect(() => {
    let raf: number;
    let last = Date.now();

    const tick = () => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;

      if (!done.current) {
        if (now - lastSpinAt.current > IDLE_MS) {
          progress.current = Math.max(
            0,
            progress.current - drainRef.current * dt,
          );
        }
        progressAnim.setValue(progress.current);

        if (progress.current >= 100) {
          done.current = true;
          onSolveRef.current();
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressAnim]);

  useEffect(() => {
    if (!cfg.switchMs) {
      dirRef.current = 0;
      return;
    }
    dirRef.current = 1;
    setDir(1);
    const id = setInterval(() => {
      const next: 1 | -1 = dirRef.current === 1 ? -1 : 1;
      dirRef.current = next;
      lastSwitchAt.current = Date.now();
      setDir(next);
    }, cfg.switchMs);
    return () => clearInterval(id);
  }, [cfg.switchMs]);

  const rotate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });
  const fillWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={s.card}>
      <Image
        source={require("../../assets/images/circuit-bg.png")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={s.content}>
        <View style={s.header}>
          <Text style={s.level}>Level {idx + 1}</Text>
          <Text style={s.title}>Circut Chalege</Text>
        </View>

        <View style={s.panel}>
          <Image source={FACES[idx]} style={s.smiley} />

          <View style={s.banner}>
            {directional && (
              <Text style={s.arrow}>{dir === 1 ? "↻" : "↺"}</Text>
            )}
            <Text
              style={s.bannerText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {directional
                ? dir === 1
                  ? "CLOCKWISE!1!!"
                  : "COUNTER-CLOCKWISE!!11"
                : "Keep Spinning!!111"}
            </Text>
          </View>

          <View
            ref={wheelRef}
            collapsable={false}
            style={s.wheel}
            {...panResponder.panHandlers}
          >
            <Animated.Image
              source={require("../../assets/images/osu-spinner.png")}
              style={[s.wheelImage, { transform: [{ rotate }] }]}
            />
          </View>
        </View>

        <View style={s.bar}>
          <Animated.View style={[s.barFill, { width: fillWidth }]} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    margin: 16,
    borderWidth: 1,
    borderColor: "#000000",
    overflow: "hidden",
    backgroundColor: "#111111",
  },
  content: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 24,
  },
  header: { alignSelf: "stretch", paddingLeft: 20 },
  level: {
    color: "#FFFFFF",
    transform: [{ rotate: "-8deg" }],
    marginBottom: -6,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#8E4DFF",
    transform: [{ rotate: "-8deg" }],
    textShadowColor: "#2a0a5e",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
  },
  panel: {
    width: 280,
    backgroundColor: "#FFB74D",
    transform: [{ rotate: "3deg" }],
    alignItems: "center",
    paddingTop: 22,
    paddingBottom: 22,
  },
  smiley: { position: "absolute", top: -20, left: -20, width: 50, height: 50 },
  banner: {
    width: "90%",
    height: 52,
    backgroundColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  arrow: {
    color: "#FFB74D",
    fontSize: 30,
    fontWeight: "bold",
  },
  bannerText: { color: "#FFFFFF", fontSize: 18, flexShrink: 1 },
  wheel: { width: 230, height: 230 },
  wheelImage: { width: 230, height: 230 },
  bar: {
    width: "90%",
    height: 14,
    borderRadius: 7,
    backgroundColor: "#6b4a00",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#000000",
    transform: [{ rotate: "-4deg" }],
  },
  barFill: { height: "100%", backgroundColor: "#e0a21a" },
});
