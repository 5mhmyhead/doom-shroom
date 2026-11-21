import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { START_ASPECT, TASKBAR_HEIGHT, XA } from '../theme/xpAssets';

type Props = { onSolve: () => void; level: number };
type BoxState = 'idle' | 'checking' | 'done';

// Level 1 = 3 boxes, every level after that adds 2 (level 5 = 11).
const BASE = 3;
const STEP = 2;
export const xpCount = (level: number) => BASE + STEP * Math.max(0, level - 1);

const TITLES = [
  'Security Check', 'Human Verification', 'Are you sure?', 'Windows Security', 'Verification Wizard',
  'Not a Bot Properties', 'System Message', 'Verification Service', 'Please Wait', 'Final Warning', 'Seriously',
];
const PROMPTS = [
  'Please confirm you are a human to continue.',
  'We could not tell. Please confirm again.',
  'This program needs to be sure.',
  'Windows has detected suspicious scrolling.',
  'One more time, for the record.',
  'Your humanity is important to us.',
];

// ------------------------------------------------------------ XP chrome
function XpWindow({ title, children, style }: { title: string; children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[x.win, style]}>
      <View style={x.titleBar}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A5CE8' }]} />
        <View style={[x.band, { top: 0, height: '38%', backgroundColor: '#3D8BFF' }]} />
        <View style={[x.band, { bottom: 0, height: '28%', backgroundColor: '#0046C9' }]} />
        <Text style={x.titleText} numberOfLines={1}>{title}</Text>
        <View style={x.tBtns}>
          <View style={x.tBtn}><Text style={x.tBtnText}>_</Text></View>
          <View style={x.tBtn}><Text style={x.tBtnText}>□</Text></View>
          <View style={[x.tBtn, { backgroundColor: '#E0502C' }]}><Text style={x.tBtnText}>x</Text></View>
        </View>
      </View>
      <View style={x.body}>{children}</View>
    </View>
  );
}

function XpButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={[x.btn, pressed && { backgroundColor: '#DCD8C4' }]}>
          <Text style={x.btnText}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

// Wallpaper: a real image when XA.wallpaper is set, otherwise sky, clouds and hills drawn from views.
function Wallpaper() {
  if (XA.wallpaper) {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          source={XA.wallpaper}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
      </View>
    );
  }
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#4F8FE8', overflow: 'hidden' }]}>
      <View style={{ position: 'absolute', top: 30, left: 20, width: 120, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF', opacity: 0.75 }} />
      <View style={{ position: 'absolute', top: 60, left: 70, width: 90, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', opacity: 0.6 }} />
      <View style={{ position: 'absolute', top: 120, right: 20, width: 140, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', opacity: 0.7 }} />
      <View style={{ position: 'absolute', bottom: -330, left: '-40%', width: '180%', height: 520, borderRadius: 260, backgroundColor: '#6BC63A' }} />
      <View style={{ position: 'absolute', bottom: -350, left: '-30%', width: '170%', height: 520, borderRadius: 260, backgroundColor: '#3E9B22' }} />
    </View>
  );
}

// Taskbar: optional bar + Start button images, with the "N of M verified" tray text on top.
function Taskbar({ done, total }: { done: number; total: number }) {
  return (
    <View style={x.taskbar}>
      {XA.taskbarBar && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image
            source={XA.taskbarBar}
            resizeMode="stretch"
            style={{ width: '100%', height: '100%' }}
          />
        </View>
      )}
      {XA.startButton ? (
        <Image
          source={XA.startButton}
          resizeMode="contain"
          style={{ height: '100%', aspectRatio: START_ASPECT }}
        />
      ) : (
        <View style={x.start}><Text style={x.startText}>start</Text></View>
      )}
      <Text>
        {done} of {total} verified
      </Text>
    </View>
  );
}

// ------------------------------------------------------------ the popup
export default function XpRobot({ onSolve, level }: Props) {
  const total = xpCount(level);
  const [states, setStates] = useState<BoxState[]>(() => Array(total).fill('idle'));
  const [showDone, setShowDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const solved = useRef(false);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Windows overlap a little and sit at slightly different offsets / angles.
  const look = useMemo(
    () => Array.from({ length: total }, (_, i) => ({
      dx: Math.round(Math.random() * 18),
      rot: (Math.random() - 0.5) * 1.6,
      title: TITLES[i % TITLES.length],
      prompt: PROMPTS[i % PROMPTS.length],
    })),
    [total],
  );

  // Every box checked -> short pause -> "you are human" dialog.
  useEffect(() => {
    if (states.length > 0 && states.every((s) => s === 'done')) {
      const t = setTimeout(() => setShowDone(true), 450);
      return () => clearTimeout(t);
    }
  }, [states]);

  const check = (i: number) => {
    if (states[i] !== 'idle') return;
    setStates((s) => s.map((v, j) => (j === i ? 'checking' : v)));
    timers.current.push(
      setTimeout(() => setStates((s) => s.map((v, j) => (j === i ? 'done' : v))), 650),
    );
  };

  const finish = () => {
    if (solved.current) return;
    solved.current = true;
    onSolve();
  };

  const doneCount = states.filter((s) => s === 'done').length;

  return (
    <View style={x.desktop}>
      <Wallpaper />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={x.windowsArea}
        showsVerticalScrollIndicator={false}
      >
        {showDone ? (
          <XpWindow title="Verification Complete" style={{ marginTop: 24 }}>
            <View style={x.dialogRow}>
              <View style={x.infoIcon}><Text style={x.infoI}>i</Text></View>
              <Text style={[x.prompt, { flex: 1, fontSize: 14 }]}>
                Thank you. You appear to be human. (Probably.)
              </Text>
            </View>
            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <XpButton label="OK" onPress={finish} />
            </View>
          </XpWindow>
        ) : (
          look.map((l, i) => (
            <XpWindow key={i} title={l.title} style={{ marginLeft: l.dx, transform: [{ rotate: `${l.rot}deg` }] }}>
              <Text style={x.prompt}>{l.prompt}</Text>
              <Pressable onPress={() => check(i)} style={x.checkRow}>
                <View style={x.box}>
                  {states[i] === 'checking' ? (
                    <ActivityIndicator size="small" color="#1C7FE0" />
                  ) : states[i] === 'done' ? (
                    <Text style={x.tick}>✓</Text>
                  ) : null}
                </View>
                <Text style={x.label}>I am not a robot</Text>
                <Text style={x.bot}>🤖</Text>
              </Pressable>
            </XpWindow>
          ))
        )}
      </ScrollView>

      <Taskbar done={doneCount} total={total} />
    </View>
  );
}

const x = StyleSheet.create({
  desktop: { flex: 1, backgroundColor: '#4F8FE8', overflow: 'hidden' },
  windowsArea: { padding: 10, gap: 12, flexGrow: 1 },
  win: { backgroundColor: '#0831D9', padding: 3, paddingTop: 0, borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: 'hidden' },
  titleBar: { height: 30, flexDirection: 'row', alignItems: 'center', paddingLeft: 8, paddingRight: 4, overflow: 'hidden' },
  band: { position: 'absolute', left: 0, right: 0 },
  titleText: { flex: 1, fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: 13, color: '#FFFFFF', textShadowColor: '#0A246A', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 0 },
  tBtns: { flexDirection: 'row', gap: 2 },
  tBtn: { width: 21, height: 21, borderRadius: 3, borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: '#2F6FE0', alignItems: 'center', justifyContent: 'center' },
  tBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', lineHeight: 13 },
  body: { backgroundColor: '#ECE9D8', padding: 12, gap: 10 },
  prompt: { fontFamily: 'sans-serif', fontSize: 13, color: '#000000' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#7F9DB9', paddingHorizontal: 12, paddingVertical: 10 },
  box: { width: 32, height: 32, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#1C5180', alignItems: 'center', justifyContent: 'center' },
  tick: { fontSize: 24, fontWeight: 'bold', color: '#1A8A1A', lineHeight: 28 },
  label: { flex: 1, fontFamily: 'sans-serif', fontSize: 16, color: '#000000' },
  bot: { fontSize: 24 },
  btn: { minWidth: 84, paddingVertical: 6, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: '#003C74', borderRadius: 3, backgroundColor: '#F4F4EC' },
  btnText: { fontFamily: 'sans-serif', fontSize: 14, color: '#000000' },
  dialogRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1F6FE0', borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  infoI: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', fontStyle: 'italic' },
  taskbar: { height: TASKBAR_HEIGHT, overflow: 'hidden', backgroundColor: '#245EDC', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 2, borderTopColor: '#5C93F0' },
  start: { height: '100%', paddingHorizontal: 16, backgroundColor: '#3C9A2B', borderTopRightRadius: 14, borderBottomRightRadius: 14, justifyContent: 'center' },
  startText: { fontFamily: 'sans-serif', fontStyle: 'italic', fontWeight: 'bold', fontSize: 18, color: '#FFFFFF', textShadowColor: '#1E5A14', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 0 },
  trayOnImage: { backgroundColor: 'transparent', textShadowColor: '#0A246A', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 0 },
  tray: { fontFamily: 'sans-serif', fontSize: 12, color: '#FFFFFF', backgroundColor: '#1B8BE8', paddingHorizontal: 12, paddingVertical: 8, height: '100%', textAlignVertical: 'center' },
});