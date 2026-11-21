import { useCallback, useEffect, useState } from "react";
import {
  useFonts,
  ComicNeue_700Bold,
  ComicNeue_400Regular,
} from "@expo-google-fonts/comic-neue";
import { BackHandler } from "react-native";
import * as Linking from "expo-linking";
import PopupScreen from "./src/screens/popup-screen";
import HomeScreen from "./src/screens/home-screen";
import {
  IS_EXPO_GO,
  grantWindow,
  parseBlockedLink,
  returnToApp,
  stopMonitor,
  styleOverlay,
} from "./src/lib/blocker";
import { levelFor } from "./src/lib/escalation";

type Mode =
  | { name: "home" }
  | { name: "popup"; app: string; pkg: string; reason: string; run: number }
  | { name: "dev"; index: number };

export default function App() {
  const [fontsLoaded] = useFonts({
    ComicNeue_400Regular,
    ComicNeue_700Bold,
  });

  const [mode, setMode] = useState<Mode>({ name: "home" });
  const [intervalSec, setIntervalSec] = useState(15);
  const [interruptions, setInterruptions] = useState(0);
  const [monitoring, setMonitoring] = useState(false);
  const level = levelFor(interruptions);

  useEffect(() => {
    styleOverlay();
  }, []);

  useEffect(() => {
    let ignore = false;

    const handle = (url: string | null) => {
      if (ignore) return;
      const link = parseBlockedLink(url);
      if (!link) return;

      setMonitoring(true);
      setInterruptions((n) => n + 1);
      setMode({
        name: "popup",
        app: link.app,
        pkg: link.pkg,
        reason: link.reason,
        run: Date.now(),
      });
    };

    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener("url", (e) => handle(e.url));
    return () => {
      ignore = true;
      sub.remove();
    };
  }, []);

  const onSolved = useCallback(async () => {
    if (mode.name !== "popup") {
      setMode({ name: "home" });
      return;
    }

    await grantWindow(intervalSec);
    setMode({ name: "home" });

    if (!IS_EXPO_GO && !(await returnToApp(mode.pkg))) {
      BackHandler.exitApp();
    }
  }, [mode, intervalSec]);

  const onEscape = useCallback(() => {
    stopMonitor();
    setMonitoring(false);
    setInterruptions(0);
    setMode({ name: "home" });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (mode.name !== "home") {
    const isPopup = mode.name === "popup";
    return (
      <PopupScreen
        key={isPopup ? mode.run : `dev-${mode.index}`}
        appName={isPopup ? mode.app : "Dev"}
        reason={isPopup ? mode.reason : "opened"}
        level={level}
        forceIndex={isPopup ? undefined : mode.index}
        onSolved={onSolved}
        onEscape={onEscape}
      />
    );
  }

  return (
    <HomeScreen
      intervalSec={intervalSec}
      setIntervalSec={setIntervalSec}
      interruptions={interruptions}
      monitoring={monitoring}
      setMonitoring={setMonitoring}
      onDev={(index) => setMode({ name: "dev", index })}
    />
  );
}
