import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { FA } from './forestAssets';

const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

export const fc = {
  pine: '#0B2A10',
  grass: '#1F6A1F',
  seam: '#154A18',
  titleTop: '#1CFF2A',
  titleSide: '#0B7A12',
  link: '#F5E400',
  gold: '#E8E070',
  leaf: '#3CCB4A',
};

// ------------------------------------------------------------ backgrounds
function RepeatingGif({ source }: { source: ImageSourcePropType }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const resolved = Image.resolveAssetSource(source);
  const tileW = Math.max(24, resolved?.width || 64);
  const tileH = Math.max(24, resolved?.height || 64);

  const cols = box.w > 0 ? Math.ceil(box.w / tileW) : 0;
  const rows = box.h > 0 ? Math.ceil(box.h / tileH) : 0;
  const count = cols * rows;

  return (
    <View
      pointerEvents="none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== box.w || height !== box.h) setBox({ w: width, h: height });
      }}
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
    >
      {count > 0 && (
        <View style={{ width: cols * tileW, height: rows * tileH, flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: count }, (_, i) => (
            <ExpoImage
              key={i}
              source={source as ExpoImageProps['source']}
              contentFit="fill"
              style={{ width: tileW, height: tileH }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function PineBackdrop() {
  const trees = useMemo(
    () => Array.from({ length: 70 }, (_, i) => ({
      x: Math.random() * 98, y: Math.random() * 96, s: 10 + Math.random() * 10,
      c: ['#0E3314', '#134A1B', '#0A230E', '#1A5A22'][i % 4],
    })),
    [],
  );
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: fc.pine }]}>
      {FA.pine ? (
        <RepeatingGif source={FA.pine} />
      ) : (
        trees.map((t, i) => (
          <Text key={i} style={{ position: 'absolute', left: `${t.x}%`, top: `${t.y}%`, color: t.c, fontSize: t.s }}>▲</Text>
        ))
      )}
    </View>
  );
}

function GrassBackdrop() {
  const blades = useMemo(
    () => Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * 98, y: Math.random() * 90, h: 10 + Math.random() * 12, r: Math.random() * 50 - 25,
      c: ['#2E8B2E', '#164F16', '#3FA03F', '#256F25'][i % 4],
    })),
    [],
  );
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: fc.grass }]}>
      {FA.grass ? (
        <RepeatingGif source={FA.grass} />
      ) : (
        blades.map((b, i) => (
          <View key={i} style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, width: 2, height: b.h, backgroundColor: b.c, transform: [{ rotate: `${b.r}deg` }] }} />
        ))
      )}
    </View>
  );
}

// ------------------------------------------------------------ motion + decor
function Twinkle({ x, y, size, delay, ms }: { x: number; y: number; size: number; delay: number; ms: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (FA.sparkle) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: ms, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: ms, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, ms]);

  if (FA.sparkle) {
    const imgSize = Math.round(size * 1.5);
    return (
      <ExpoImage
        source={FA.sparkle as ExpoImageProps['source']}
        contentFit="contain"
        style={{
          position: 'absolute',
          left: `${x}%` as any,
          top: `${y}%` as any,
          width: imgSize,
          height: imgSize,
        }}
      />
    );
  }

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: `${x}%` as any,
        top: `${y}%` as any,
        color: '#FFFFFF',
        fontSize: size,
        opacity: v,
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.25] }) }],
      }}
    >
      ✦
    </Animated.Text>
  );
}

function Twinkles({ count = 14 }: { count?: number }) {
  const pts = useMemo(
    () => Array.from({ length: count }, () => ({
      x: Math.random() * 94, y: Math.random() * 92, size: 10 + Math.random() * 10,
      delay: Math.random() * 3000, ms: 700 + Math.random() * 900,
    })),
    [count],
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pts.map((p, i) => <Twinkle key={i} {...p} />)}
    </View>
  );
}

function Critter({
  char, size = 48, source, style, flip = false, ms = 2400, rotate = 0,
}: { char: string; size?: number; source?: ImageSourcePropType | null; style?: ViewStyle; flip?: boolean; ms?: number; rotate?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [ms]);
  const transform: any = [
    { translateY: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -5, 0] }) },
    { scaleX: flip ? -1 : 1 },
    { rotate: `${rotate}deg` },
  ];
  return (
    <View pointerEvents="none" style={[{ position: 'absolute' }, style]}>
      {source ? (
        <AnimatedExpoImage
          source={source as ExpoImageProps['source']}
          contentFit="contain"
          style={{ width: size, height: size, transform }}
        />
      ) : (
        <Animated.Text style={{ fontSize: size, transform }}>{char}</Animated.Text>
      )}
    </View>
  );
}

// ------------------------------------------------------------ title + links
// Blocky green "pixel" lettering: bright face with a dark extrude.
function ForestTitle({ text, size = 40 }: { text: string; size?: number }) {
  const base = { fontFamily: 'Silkscreen_700Bold', fontSize: size, letterSpacing: 2 };
  return (
    <View style={{ alignSelf: 'center', paddingRight: 5, paddingBottom: 5 }}>
      {[5, 4, 3, 2, 1].map((i) => (
        <Text key={i} numberOfLines={1} style={[base, { position: 'absolute', left: i, top: i, color: i === 5 ? '#000' : fc.titleSide }]}>{text}</Text>
      ))}
      <Text numberOfLines={1} style={[base, { color: fc.titleTop }]}>{text}</Text>
    </View>
  );
}

function LeafLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={f.linkRow}>
          {FA.leaf ? (
            <ExpoImage
              source={FA.leaf as ExpoImageProps['source']}
              style={{ width: 22, height: 22 }}
              contentFit="contain"
            />
          ) : (
            <Text style={f.leaf}>🍃</Text>
          )}
          <Text style={[f.link, pressed && { color: '#FFFFFF', textDecorationColor: '#FFFFFF' }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ------------------------------------------------------------ section 3
export function ForestMonitoringSection({
  monitoring, appsListed, interruptions, onStart, onStop,
}: { monitoring: boolean; appsListed: number; interruptions: number; onStart: () => void; onStop: () => void }) {
  return (
    <View style={f.pineZone}>
      <PineBackdrop />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(11, 42, 16, 0)', 'rgba(16, 58, 20, 0.78)', fc.seam]}
        locations={[0, 0.55, 1]}
        style={f.pineFadeBottom}
      />
      <Twinkles count={14} />

      <Critter char="🌿" size={78} source={FA.fern} style={{ top: -8, left: -10 }} rotate={25} ms={3200} />
      <Critter char="🌿" size={78} source={FA.fern} style={{ top: -8, right: -10 }} rotate={-25} flip ms={3600} />
      <Critter char="🐸" size={70} source={FA.frog} style={{ top: 110, left: -26 }} ms={2800} />
      <Critter char="🐸" size={70} source={FA.frog} style={{ top: 110, right: -26 }} flip ms={3000} />

      <View style={f.titleRow}>
        <Critter char="🧚" size={50} source={FA.fairy} style={{ position: 'relative' }} ms={2200} />
        <ForestTitle text="MONITOR" size={32} />
        <Critter char="🧚" size={50} source={FA.fairy} style={{ position: 'relative' }} flip ms={2500} />
      </View>

      <Text style={f.sub}>
        {monitoring
          ? 'RUNNING. The forest is awake and watching over your apps.'
          : 'STOPPED. The forest is asleep. Press start to wake it.'}
      </Text>
      <Text style={f.sub}>
        {appsListed} apps listed. Interruptions so far: {interruptions}.
      </Text>

      <View style={f.linkWrap}>
        <LeafLink label="start" onPress={onStart} />
        <LeafLink label="stop" onPress={onStop} />
      </View>

      <Critter char="🦜" size={44} source={FA.toucan} style={{ bottom: 12, right: 24 }} ms={2000} />
    </View>
  );
}

// ------------------------------------------------------------ section 4
export function ForestDevSection({
  items, onPick,
}: { items: { id: string; title: string }[]; onPick: (index: number) => void }) {
  return (
    <View style={f.grassZone}>
      <GrassBackdrop />
      <LinearGradient
        pointerEvents="none"
        colors={[fc.seam, 'rgba(26, 90, 27, 0.72)', 'rgba(31, 106, 31, 0)']}
        locations={[0, 0.45, 1]}
        style={f.grassFadeTop}
      />
      <Twinkles count={10} />

      <Critter char="🌿" size={64} source={FA.fern} style={{ bottom: -6, left: -8 }} rotate={-10} ms={3400} />
      <Critter char="🌱" size={52} source={FA.fern} style={{ bottom: -4, right: 6 }} ms={2600} />

      <ForestTitle text="POPUPS" size={28} />
      <Text style={f.sub}>Secret paths through the trees: tap one to test that popup.</Text>

      <View style={f.linkWrap}>
        {items.map((c, i) => <LeafLink key={c.id} label={c.title} onPress={() => onPick(i)} />)}
      </View>

      <Critter char="👀" size={40} source={FA.eyes} style={{ bottom: -12, alignSelf: 'center', left: '44%' as any }} ms={2800} />
    </View>
  );
}

const f = StyleSheet.create({
  pineZone: { overflow: 'hidden', backgroundColor: fc.pine, paddingTop: 44, paddingBottom: 60, paddingHorizontal: 30, gap: 8 },
  grassZone: { overflow: 'hidden', backgroundColor: fc.grass, paddingTop: 32, paddingBottom: 50, paddingHorizontal: 22, gap: 8 },
  pineFadeBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 48 },
  grassFadeTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 44 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 },
  sub: { fontFamily: 'Fondamento_400Regular_Italic', fontSize: 18, color: fc.gold, textAlign: 'center' },
  linkWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 22, rowGap: 14, marginTop: 14 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leaf: { fontSize: 20 },
  link: { fontFamily: 'Fondamento_400Regular', fontSize: 22, color: fc.link, textDecorationLine: 'underline', textDecorationColor: fc.link },
});