import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import { HA } from '../theme/hellAssets';
import { FA } from '../theme/forestAssets';
import { KA } from '../theme/kawaiiAssets';
import { ASSETS } from '../theme/gothicAssets';
import type { PopupProps } from './types';

const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

const hc = {
  lava: '#B01C00',
  deep: '#4A0000',
  black: '#120000',
  ember: '#FF5A00',
  flame: '#FFD21A',
  white: '#FFF6D8',
};

// ------------------------------------------------------------ shared hell motion & backdrops
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

function HellBackdrop() {
  const blobs = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        x: Math.random() * 110 - 10,
        y: Math.random() * 110 - 10,
        s: 70 + Math.random() * 130,
        c: ['#FF6A00', '#FFC400', '#6E0A00', '#FF2A00'][i % 4],
        o: 0.35 + Math.random() * 0.3,
      })),
    [],
  );

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: hc.lava }]}>
      {HA.fire ? (
        <RepeatingGif source={HA.fire} />
      ) : (
        blobs.map((b, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: `${b.x}%` as any,
              top: `${b.y}%` as any,
              width: b.s,
              height: b.s,
              borderRadius: b.s / 2,
              backgroundColor: b.c,
              opacity: b.o,
            }}
          />
        ))
      )}
    </View>
  );
}

function Fire({
  char,
  size = 32,
  source,
  style,
  ms = 500,
  min = 0.85,
}: {
  char: string;
  size?: number;
  source?: ImageSourcePropType | null;
  style?: ViewStyle;
  ms?: number;
  min?: number;
}) {
  const v = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let stop = false;
    const tick = () => {
      if (stop) return;
      Animated.timing(v, {
        toValue: min + Math.random() * (1.2 - min),
        duration: ms * (0.5 + Math.random()),
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(tick);
    };
    tick();
    return () => {
      stop = true;
      v.stopAnimation();
    };
  }, [ms, min]);

  const transform: any = [{ scaleY: v }];

  return (
    <View pointerEvents="none" style={style}>
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

function FlameStrip({ count = 9, size = 24 }: { count?: number; size?: number }) {
  if (HA.flame) {
    const resolved = Image.resolveAssetSource(HA.flame);
    const aspectRatio =
      resolved?.width && resolved?.height ? resolved.width / resolved.height : 10;

    return (
      <View pointerEvents="none" style={{ width: '100%' }}>
        <ExpoImage
          source={HA.flame as ExpoImageProps['source']}
          contentFit="contain"
          style={{ width: '100%', aspectRatio }}
        />
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }} pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <Fire key={i} char="🔥" size={size} ms={380 + (i % 3) * 120} />
      ))}
    </View>
  );
}

function FireTitle({ text, size = 40 }: { text: string; size?: number }) {
  const base = { fontFamily: 'MetalMania_400Regular', fontSize: size, letterSpacing: 2 };
  const layers: [number, string][] = [
    [5, '#1A0000'],
    [4, '#4A0000'],
    [3, '#8A1000'],
    [2, '#C82800'],
    [1, '#FF6A00'],
  ];

  return (
    <View style={{ alignSelf: 'center', paddingRight: 6, paddingBottom: 6 }}>
      {layers.map(([i, c]) => (
        <Text key={i} numberOfLines={1} style={[base, { position: 'absolute', left: i, top: i, color: c }]}>
          {text}
        </Text>
      ))}
      <Text numberOfLines={1} style={[base, { color: hc.flame }]}>
        {text}
      </Text>
    </View>
  );
}

function Starburst({ text, size = 54, style }: { text: string; size?: number; style?: ViewStyle }) {
  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      {[0, 30, 60].map((r) => (
        <View
          key={r}
          style={{
            position: 'absolute',
            width: size * 0.72,
            height: size * 0.72,
            backgroundColor: '#E00000',
            transform: [{ rotate: `${r}deg` }],
          }}
        />
      ))}
      <Text style={{ fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: size * 0.24, color: '#FFE000' }}>
        {text}
      </Text>
    </View>
  );
}

function HellButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={[
            s.btn,
            pressed && {
              borderTopColor: '#7A1000',
              borderLeftColor: '#7A1000',
              borderRightColor: '#FF9A80',
              borderBottomColor: '#FF9A80',
            },
          ]}
        >
          <Text style={s.btnText}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ------------------------------------------------------------ captcha tiles (all theme GIFs)
type Tile = {
  id: number;
  emoji: string;
  source?: ImageSourcePropType | null;
  label: string;
  evil: boolean;
};

const TILES: Tile[] = [
  { id: 1, emoji: '😈', source: HA.devil, label: 'Demon', evil: true },
  { id: 2, emoji: '🐸', source: FA.frog, label: 'Frog', evil: false },
  { id: 3, emoji: '💀', source: HA.skull, label: 'Doomscroll', evil: true },
  { id: 4, emoji: '🐱', source: KA.cat, label: 'Kitty', evil: false },
  { id: 5, emoji: '🌋', source: HA.volcano, label: 'Hellfire', evil: true },
  { id: 6, emoji: '🌈', source: KA.rainbow, label: 'Rainbow', evil: false },
  { id: 7, emoji: '🧚', source: FA.fairy, label: 'Fairy', evil: false },
  { id: 8, emoji: '🔱', source: HA.trident, label: 'Taxes', evil: true },
  { id: 9, emoji: '🦜', source: FA.toucan, label: 'Toucan', evil: false },
];

export default function HellCaptcha(props: PopupProps) {
  const { onSolve } = props;
  const appName = (props as { appName?: string }).appName || 'this app';

  const tiles = useMemo(() => [...TILES].sort(() => Math.random() - 0.5), []);
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: number) => {
    setError(null);
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const verify = () => {
    const evilIds = tiles.filter((t) => t.evil).map((t) => t.id);
    const isMatch =
      selected.length === evilIds.length && evilIds.every((id) => selected.includes(id));

    if (isMatch) {
      onSolve();
      return;
    }

    setSelected([]);
    setError('WRONG! Straight to the boiler room. Try again.');
  };

  return (
    <View style={s.root}>
      <HellBackdrop />

      <ScrollView
        contentContainerStyle={s.scroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <FlameStrip />

        {/* Header */}
        <View style={{ marginTop: 2 }}>
          <FireTitle text="SIN-CAPTCHA" size={40} />
          <View style={s.ring}>
            {HA.devil ? (
              <ExpoImage
                source={HA.devil as ExpoImageProps['source']}
                contentFit="contain"
                style={{ width: 24, height: 24 }}
              />
            ) : (
              <Text style={{ fontSize: 20 }}>😈</Text>
            )}
          </View>
          <Text style={s.url}>www.hell.com/captcha</Text>
        </View>

        <Starburst text="Hot!" style={{ top: 58, left: 6, zIndex: 5 }} />

        {/* Oval Prompt Banner */}
        <View style={s.oval}>
          <Text style={s.welcome}>Select all PURE EVIL</Text>
          <Text style={s.sub}>prove your soul to keep using {appName}</Text>
        </View>

        {/* Captcha Box */}
        <View style={s.card}>
          <View style={s.grid}>
            {tiles.map((tile, idx) => {
              const on = selected.includes(tile.id);
              const alt = idx % 2 === 1;
              const solidBg = on ? '#FF4A00' : alt ? '#7A0E00' : '#5A0A00';
              const tintBg = on
                ? 'rgba(255, 74, 0, 0.65)'
                : alt
                  ? 'rgba(122, 14, 0, 0.72)'
                  : 'rgba(90, 10, 0, 0.72)';

              return (
                <Pressable
                  key={tile.id}
                  onPress={() => toggle(tile.id)}
                  style={[s.tile, { backgroundColor: solidBg }, on && s.tileOn]}
                >
                  {HA.rowTile && (
                    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                      <RepeatingGif source={HA.rowTile} />
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: tintBg }]} />
                    </View>
                  )}

                  {tile.source ? (
                    <ExpoImage
                      source={tile.source as ExpoImageProps['source']}
                      contentFit="contain"
                      style={{ width: 46, height: 46 }}
                    />
                  ) : (
                    <Text style={s.emoji}>{tile.emoji}</Text>
                  )}

                  <Text style={[s.label, on && s.labelOn]} numberOfLines={1}>
                    {tile.label}
                  </Text>

                  {on && (
                    <View style={s.badge}>
                      <Text style={s.badgeText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {error && <Text style={s.error}>{error}</Text>}

          <View style={s.footerRow}>
            <View style={s.robotRow}>
              <View style={s.checkBox}>
                {HA.fire ? (
                  <ExpoImage
                    source={HA.fire as ExpoImageProps['source']}
                    contentFit="cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <Fire char="🔥" size={16} ms={420} />
                )}
              </View>
              <Text style={s.robotText}>Not a mortal</Text>
            </View>

            <View style={{ flex: 1 }}>
              <HellButton label="VERIFY SOUL" onPress={verify} />
              <Text style={s.newTag}>FREE</Text>
            </View>
          </View>
        </View>

        {/* Bottom Hell Scene */}
        <View style={s.footScene}>
          <Fire char="🌋" size={38} source={HA.volcano} ms={900} min={0.95} />
          <View style={s.skullRing}>
            <Fire char="💀" size={26} source={HA.skull} ms={700} min={0.92} />
          </View>
          <Fire char="🔱" size={34} source={HA.trident} ms={1100} min={0.95} />
          <Fire char="🔥" size={34} source={ASSETS.torch} ms={1000} min={0.95} />
        </View>

        <FlameStrip count={10} size={20} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: hc.lava,
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 14,
    gap: 8,
  },
  ring: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#FFB000',
    backgroundColor: '#7A0A00',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  url: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 13,
    color: '#FFF',
    textDecorationLine: 'underline',
    alignSelf: 'flex-end',
    marginTop: -2,
  },
  oval: {
    alignSelf: 'center',
    width: '94%',
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#7A1200',
    backgroundColor: 'rgba(60, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  welcome: {
    fontFamily: 'Almendra_700Bold_Italic',
    fontSize: 25,
    color: hc.flame,
    textShadowColor: '#7A0A00',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  sub: {
    fontFamily: 'Almendra_700Bold_Italic',
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(26, 0, 0, 0.78)',
    borderWidth: 4,
    borderTopColor: '#FF9A80',
    borderLeftColor: '#FF9A80',
    borderRightColor: '#7A1000',
    borderBottomColor: '#7A1000',
    padding: 8,
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  tile: {
    overflow: 'hidden',
    width: '31.5%',
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: '#2A0000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tileOn: {
    borderColor: hc.flame,
  },
  emoji: {
    fontSize: 34,
  },
  label: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 14,
    color: '#FFD9B0',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  labelOn: {
    fontFamily: 'Almendra_700Bold',
    color: hc.flame,
  },
  badge: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: '#120000',
    borderWidth: 1.5,
    borderColor: hc.flame,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    fontSize: 11,
    color: hc.flame,
  },
  error: {
    fontFamily: 'Almendra_700Bold',
    fontSize: 14,
    color: hc.flame,
    backgroundColor: '#1A0000',
    borderWidth: 2,
    borderColor: hc.ember,
    paddingVertical: 5,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 2,
  },
  robotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2A0000',
    borderWidth: 2,
    borderColor: '#7A1200',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  checkBox: {
    width: 22,
    height: 22,
    overflow: 'hidden',
    backgroundColor: hc.black,
    borderWidth: 2,
    borderColor: hc.flame,
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotText: {
    fontFamily: 'Almendra_700Bold',
    fontSize: 14,
    color: hc.white,
  },
  btn: {
    backgroundColor: '#D8503A',
    borderWidth: 4,
    borderTopColor: '#FF9A80',
    borderLeftColor: '#FF9A80',
    borderRightColor: '#7A1000',
    borderBottomColor: '#7A1000',
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Almendra_700Bold',
    fontSize: 18,
    color: '#000',
  },
  newTag: {
    position: 'absolute',
    top: -9,
    right: 4,
    fontFamily: 'sans-serif',
    fontStyle: 'italic',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
    textShadowColor: hc.flame,
    textShadowOffset: { width: 1.5, height: 1.5 },
    textShadowRadius: 0,
    transform: [{ rotate: '-8deg' }],
  },
  footScene: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  skullRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: '#8A1A00',
    backgroundColor: '#C23000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});