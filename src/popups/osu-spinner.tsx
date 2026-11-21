import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { PopupProps } from "./types";
import { useRef, useEffect, useMemo } from "react";
import type { ComponentRef } from "react";

const rotationsToFill = (level: number) => Math.min(4 + level, 14);
const drainPerSecond = (level: number) => Math.min(8 + level * 3, 30);

const IDLE_MS = 120;

export default function OsuSpinner({ onSolve, level }: PopupProps) {
  const fillPerDegree = 100 / (rotationsToFill(level) * 360);
  const drain = drainPerSecond(level);

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
          <Text style={s.level}>Level {level + 1}</Text>
          <Text style={s.title}>Circut Chalege</Text>
        </View>

        <View style={s.panel}>
          <Image
            source={require("../../assets/difficulty faces/Normal_Icon.png")}
            style={s.smiley}
          />

          <View style={s.banner}>
            <Text style={s.bannerText}>Keep Spinning!!111</Text>
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  bannerText: { color: "#FFFFFF", fontSize: 18 },
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
