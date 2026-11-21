import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { KA } from './kawaiiAssets';

const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

export const kc = {
  yellow: '#F1F6A0', faint: '#FCFEDD',
  mint: '#A8FBE3', mintLine: '#5ED3B2',
  mintGrad: ['#E6FFF7', '#A8FBE3', '#73E6C4'] as const,
  peach: '#FFC9A3', peachLine: '#E9A57B',
  lav: '#B9A7F5', lavLine: '#8F7BE0',
  lavGrad: ['#E3D6FF', '#B9A7F5', '#967CEB'] as const,
  pink: '#FFB6D5', magenta: '#FF1493',
  blue: '#3C9CEB', sky: '#CFEAFF',
  green: '#58B52D', greenDark: '#2E7D14',
  sun: '#FFEE00', ink: '#111111',
};

// ------------------------------------------------------------ little pieces
type KSpriteProps = {
  char?: string; size?: number; kind?: 'hop' | 'bob' | 'wiggle'; ms?: number; delay?: number;
  source?: ImageSourcePropType | null;
};
function KSprite({ char, size = 32, kind = 'hop', ms = 1300, delay = 0, source }: KSpriteProps) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([Animated.delay(delay), Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true })]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const transform: any =
    kind === 'hop'
      ? [{ translateY: v.interpolate({ inputRange: [0, 0.2, 0.4, 1], outputRange: [0, -10, 0, 0] }) }]
      : kind === 'bob'
      ? [{ translateY: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -5, 0] }) }]
      : [{ rotate: v.interpolate({ inputRange: [0, 0.25, 0.75, 1], outputRange: ['0deg', '-10deg', '10deg', '0deg'] }) }];
  if (source) {
    return (
      <AnimatedExpoImage
        source={source as ExpoImageProps['source']}
        contentFit="contain"
        style={{ width: size, height: size, transform }}
      />
    );
  }
  return <Animated.Text style={{ fontSize: size, transform }}>{char}</Animated.Text>;
}

// Faint line-pattern feel for the yellow page (or a real tile if provided).
function PageBackdrop() {
  const marks = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({ x: Math.random() * 96, y: Math.random() * 96, ch: i % 3 === 0 ? '+' : i % 3 === 1 ? '·' : '✦', s: 10 + Math.random() * 8 })),
    [],
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {KA.tile ? (
        <Image source={KA.tile} resizeMode="repeat" style={StyleSheet.absoluteFill} />
      ) : (
        marks.map((m, i) => (
          <Text key={i} style={{ position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, color: kc.faint, fontSize: m.s }}>{m.ch}</Text>
        ))
      )}
    </View>
  );
}

function Panel({
  bg,
  colors,
  line,
  children,
  style,
  width = 3,
}: {
  bg?: string;
  colors?: readonly [string, string, ...string[]];
  line: string;
  children: ReactNode;
  style?: ViewStyle;
  width?: number;
}) {
  if (colors) {
    return (
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[{ borderWidth: width, borderColor: line, padding: 10 }, style]}
      >
        {children}
      </LinearGradient>
    );
  }
  return <View style={[{ backgroundColor: bg, borderWidth: width, borderColor: line, padding: 10 }, style]}>{children}</View>;
}

function DividerImage({ source }: { source: ImageSourcePropType }) {
  const resolved = Image.resolveAssetSource(source);
  const aspectRatio =
    resolved?.width && resolved?.height ? resolved.width / resolved.height : 12;

  return (
    <ExpoImage
      source={source as ExpoImageProps['source']}
      contentFit="contain"
      style={{ width: '100%', aspectRatio }}
    />
  );
}

function BambooDivider() {
  if (KA.bamboo) return <DividerImage source={KA.bamboo} />;

  return (
    <View style={k.bamboo}>
      <View style={k.bambooShine} />
      {[0, 1, 2, 3].map((i) => <View key={i} style={k.bambooJoint} />)}
    </View>
  );
}

const PASTEL = ['#FF9AA2', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#BDB2FF'] as const;
const RAINBOW_GRAD = ['#FF1E56', '#FF8C00', '#FFE600', '#2EE600', '#00C8FF', '#A61CFF'] as const;
const RAINBOW_STOPS = [0.08, 0.25, 0.42, 0.58, 0.75, 0.92] as const;

function RainbowBand() {
  if (KA.rainbow) return <DividerImage source={KA.rainbow} />;

  return (
    <View>
      {PASTEL.map((c) => <View key={c} style={{ height: 5, backgroundColor: c }} />)}
    </View>
  );
}

// Menu cell: icon box on the left, harsh diagonal rainbow label box on the right, sky-blue frame.
function StarButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={[k.menuRow, pressed && { backgroundColor: '#FFF27A' }]}>
          <View style={k.menuIcon}>
            {KA.star ? (
              <ExpoImage
                source={KA.star as ExpoImageProps['source']}
                style={{ width: 26, height: 26 }}
                contentFit="contain"
              />
            ) : (
              <Text style={{ fontSize: 22 }}>{icon}</Text>
            )}
          </View>
          <LinearGradient
            colors={pressed ? ['#FFF27A', '#FF8C00'] : RAINBOW_GRAD}
            locations={pressed ? undefined : RAINBOW_STOPS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={k.menuLabel}
          >
            <Text style={k.menuText}>{label}</Text>
          </LinearGradient>
        </View>
      )}
    </Pressable>
  );
}

function InlineAd({ source }: { source?: ImageSourcePropType | null }) {
  if (!source) return null;
  const resolved = Image.resolveAssetSource(source);
  const aspectRatio =
    resolved?.width && resolved?.height ? resolved.width / resolved.height : 2.5;

  return (
    <ExpoImage
      source={source as ExpoImageProps['source']}
      contentFit="contain"
      style={{ height: 24, aspectRatio, marginHorizontal: 5 }}
    />
  );
}

function Row({
  label,
  value,
  last,
  before,
  middle,
  after,
}: {
  label: string;
  value: string;
  last?: boolean;
  before?: ImageSourcePropType | null;
  middle?: ImageSourcePropType | null;
  after?: ImageSourcePropType | null;
}) {
  return (
    <View style={[k.tRow, !last && k.tRowLine]}>
      <InlineAd source={before} />
      <Text style={k.tLabel}>{label}: </Text>
      <InlineAd source={middle} />
      <Text style={k.tValue}>{value}</Text>
      <InlineAd source={after} />
    </View>
  );
}

// ------------------------------------------------------------ section 2
export function KawaiiIntervalSection({ intervalSec, setIntervalSec }: { intervalSec: number; setIntervalSec: (n: number) => void }) {
  return (
    <View style={k.zone}>
      <PageBackdrop />

      {/* fruit bleeding off the top corners, like the reference */}
      <View style={k.fruitL}><KSprite char="🍎" size={58} kind="bob" source={KA.fruit} /></View>
      <View style={k.fruitR}><KSprite char="🍒" size={54} kind="bob" ms={1700} source={KA.fruit} /></View>

      <View style={k.hens}>
        {[0, 1, 2, 3].map((i) => <KSprite key={i} char="🐔" size={50} kind="hop" delay={i * 220} ms={1400} source={KA.hen} />)}
      </View>

      <Text style={k.sub}>時間設定 ~ (^_^)</Text>

      <Panel colors={kc.mintGrad} line={kc.mintLine}>
        <View style={k.rowCenter}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={k.pinkHead}>Interval</Text>
            <Text style={k.body}>Allowed {intervalSec} seconds between interruptions.</Text>
          </View>
          <KSprite char="🐱" size={66} kind="wiggle" ms={2600} source={KA.cat} />
        </View>
      </Panel>

      <BambooDivider />

      <View style={k.lavWrap}>
        <Panel colors={kc.lavGrad} line={kc.lavLine} style={k.lavPanel}>
          <Text style={k.bigNumber}>{intervalSec} sec</Text>
          <Text style={k.bigSub}>best enjoyed between interruptions!</Text>
        </Panel>

        <View style={k.newTag}><Text style={k.newTagText}>新しい!!</Text></View>

        <View pointerEvents="none" style={k.animeOverlay}>
          <KSprite char="👧" size={120} kind="bob" ms={2000} source={KA.anime} />
        </View>
      </View>

      <View style={k.menu}>
        <StarButton icon="⭐" label="less (-5s)" onPress={() => setIntervalSec(Math.max(5, intervalSec - 5))} />
        <StarButton icon="🌀" label="more (+5s)" onPress={() => setIntervalSec(intervalSec + 5)} />
      </View>

      {/* pink "profile card" table */}
      <View style={k.pinkOuter}>
        <View style={k.pinkInner}>
          <View style={[k.tRow, k.tRowLine]}><Text style={k.tHead}>檔案 Interval profile</Text></View>
          <Row before={KA.ad1} label="Allowed" value={`${intervalSec} sec`} />
          <Row label="Step" value="5 sec" after={KA.ad2} />
          <Row label="Minimum" middle={KA.ad3} value="5 sec" last />
        </View>
      </View>

      <RainbowBand />
    </View>
  );
}

const k = StyleSheet.create({
  zone: { backgroundColor: kc.yellow, overflow: 'hidden', padding: 14, paddingTop: 52, gap: 12 },
  fruitL: { position: 'absolute', top: -10, left: -10 },
  fruitR: { position: 'absolute', top: -8, right: -12 },
  hens: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  sub: { fontFamily: 'PatrickHand_400Regular', fontSize: 16, fontWeight: 900, color: kc.greenDark, textAlign: 'center', marginTop: -4 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pinkHead: { fontFamily: 'Fredoka_700Bold', fontSize: 36, color: '#E8157A' },
  body: { fontFamily: 'PatrickHand_400Regular', fontSize: 17, color: kc.ink },
  bamboo: { height: 20, borderRadius: 10, backgroundColor: '#86C93F', borderWidth: 2, borderColor: '#4E8B1F', overflow: 'hidden', flexDirection: 'row', justifyContent: 'space-around' },
  bambooShine: { position: 'absolute', top: 3, left: 10, right: 10, height: 3, borderRadius: 2, backgroundColor: '#C9F28A' },
  bambooJoint: { width: 6, backgroundColor: '#4E8B1F', opacity: 0.6 },
  lavWrap: { marginVertical: 4 },
  lavPanel: { alignItems: 'center', paddingVertical: 14, paddingRight: 84 },
  animeOverlay: { position: 'absolute', right: -8, top: -20, bottom: -20, justifyContent: 'center' },
  bigNumber: { fontFamily: 'Fredoka_700Bold', fontSize: 46, color: kc.sun, textDecorationLine: 'underline', textShadowColor: '#5B3FD0', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  bigSub: { fontFamily: 'PatrickHand_400Regular', fontSize: 18, color: kc.sun, textAlign: 'center' },
  newTag: { position: 'absolute', top: -10, left: -6, backgroundColor: '#E000E0', paddingHorizontal: 8, paddingVertical: 2, transform: [{ rotate: '-6deg' }], borderWidth: 2, borderColor: '#FFF' },
  newTagText: { fontFamily: 'Fredoka_700Bold', fontSize: 13, color: kc.sun },
  menu: { gap: 6 },
  menuRow: { flexDirection: 'row', gap: 3, padding: 3, borderWidth: 3, borderColor: kc.blue, backgroundColor: kc.sky },
  menuIcon: { width: 46, height: 40, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#8EC5F2', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, height: 40, borderWidth: 1, borderColor: '#8EC5F2', alignItems: 'center', justifyContent: 'center' },
  menuText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16, color: kc.ink },
  pinkOuter: { backgroundColor: kc.pink, padding: 6 },
  pinkInner: { backgroundColor: '#FFF', borderWidth: 4, borderColor: kc.magenta },
  tRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6 },
  tRowLine: { borderBottomWidth: 3, borderBottomColor: kc.magenta },
  tHead: { fontFamily: 'Fredoka_700Bold', fontSize: 17, color: '#E00000' },
  tLabel: { fontFamily: 'PatrickHand_400Regular', fontSize: 17, color: '#1F4FE0' },
  tValue: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15, color: kc.ink },
});