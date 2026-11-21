import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, ImageSourcePropType, Linking, Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import { HA } from './hellAssets';

const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

const FRIEND_INSTAGRAM_URL = 'https://www.instagram.com/d_a_v_e2705/';

// Funny hell-themed apps section: fire wallpaper, flaming lettering, starburst stickers,
// a fire ring "Welcome", and a list where selected apps are "condemned".

export const hc = {
  lava: '#B01C00', deep: '#4A0000', black: '#120000',
  ember: '#FF5A00', flame: '#FFD21A', white: '#FFF6D8',
};

// ------------------------------------------------------------ backdrop + motion
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
    () => Array.from({ length: 16 }, (_, i) => ({
      x: Math.random() * 110 - 10, y: Math.random() * 110 - 10, s: 70 + Math.random() * 130,
      c: ['#FF6A00', '#FFC400', '#6E0A00', '#FF2A00'][i % 4], o: 0.35 + Math.random() * 0.3,
    })),
    [],
  );
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: hc.lava }]}>
      {HA.fire ? (
        <RepeatingGif source={HA.fire} />
      ) : (
        blobs.map((b, i) => (
          <View key={i} style={{ position: 'absolute', left: `${b.x}%` as any, top: `${b.y}%` as any, width: b.s, height: b.s, borderRadius: b.s / 2, backgroundColor: b.c, opacity: b.o }} />
        ))
      )}
    </View>
  );
}

// Flickering emoji / GIF: scaleY wobble from the base, like a flame.
function Fire({ char, size = 32, source, style, ms = 500, min = 0.85 }: { char: string; size?: number; source?: ImageSourcePropType | null; style?: ViewStyle; ms?: number; min?: number }) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let stop = false;
    const tick = () => {
      if (stop) return;
      Animated.timing(v, { toValue: min + Math.random() * (1.2 - min), duration: ms * (0.5 + Math.random()), easing: Easing.linear, useNativeDriver: true }).start(tick);
    };
    tick();
    return () => { stop = true; v.stopAnimation(); };
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

function FlameStrip({ count = 9, size = 26 }: { count?: number; size?: number }) {
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

// Flaming lettering: yellow face, orange to dark-red extrude.
function FireTitle({ text, size = 48 }: { text: string; size?: number }) {
  const base = { fontFamily: 'MetalMania_400Regular', fontSize: size, letterSpacing: 2 };
  const layers: [number, string][] = [[5, '#1A0000'], [4, '#4A0000'], [3, '#8A1000'], [2, '#C82800'], [1, '#FF6A00']];
  return (
    <View style={{ alignSelf: 'center', paddingRight: 6, paddingBottom: 6 }}>
      {layers.map(([i, c]) => (
        <Text key={i} numberOfLines={1} style={[base, { position: 'absolute', left: i, top: i, color: c }]}>{text}</Text>
      ))}
      <Text numberOfLines={1} style={[base, { color: hc.flame }]}>{text}</Text>
    </View>
  );
}

// Red starburst sticker, built from rotated squares.
function Starburst({ text, size = 60, style }: { text: string; size?: number; style?: ViewStyle }) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      {[0, 30, 60].map((r) => (
        <View key={r} style={{ position: 'absolute', width: size * 0.72, height: size * 0.72, backgroundColor: '#E00000', transform: [{ rotate: `${r}deg` }] }} />
      ))}
      <Text style={{ fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: size * 0.26, color: '#FFE000' }}>{text}</Text>
    </View>
  );
}

function HellButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={[h.btn, pressed && { borderTopColor: '#7A1000', borderLeftColor: '#7A1000', borderRightColor: '#FF9A80', borderBottomColor: '#FF9A80' }]}>
          <Text style={h.btnText}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ------------------------------------------------------------ header (title + controls)
export function HellAppsHeader({
  selectedCount, filter, onFilter, onLoad,
}: { selectedCount: number; filter: string; onFilter: (t: string) => void; onLoad: () => void }) {
  return (
    <View style={h.zone}>
      <HellBackdrop />
      <FlameStrip />

      <View style={{ marginTop: 6 }}>
        <FireTitle text="INFERNO" size={50} />
        <View style={h.ring}>
          {HA.devil ? (
            <ExpoImage
              source={HA.devil as ExpoImageProps['source']}
              contentFit="contain"
              style={{ width: 26, height: 26 }}
            />
          ) : (
            <Text style={{ fontSize: 22 }}>😈</Text>
          )}
        </View>
        <Text style={h.url}>www.hell.com/apps</Text>
      </View>

      <Starburst text="Hot!" style={{ top: 78, left: 6 }} />

      <View style={h.oval}>
        <Text style={h.welcome}>Welcome to the pit</Text>
        <Text style={h.sub}>pick the apps you wish to condemn</Text>
      </View>

      <View style={h.sceneRow}>
        <Fire char="🌋" size={54} source={HA.volcano} ms={900} min={0.95} />
        <View style={h.skullRing}><Fire char="💀" size={34} source={HA.skull} ms={700} min={0.92} /></View>
        <Fire char="🔱" size={44} source={HA.trident} ms={1100} min={0.95} />
        <Fire char="🧯" size={40} ms={1000} min={0.95} />
      </View>
      <Text style={h.tiny}>(fire extinguisher included, does nothing)</Text>

      <View style={{ gap: 10 }}>
        <View>
          <HellButton label="load installed apps" onPress={onLoad} />
          <Text style={h.newTag}>NEW</Text>
        </View>
        <TextInput
          value={filter}
          onChangeText={onFilter}
          placeholder="find your sins (filter)"
          placeholderTextColor="#FF9A55"
          style={h.input}
        />
        <Text style={h.count}>{selectedCount} selected: condemned to the pit</Text>
      </View>
    </View>
  );
}

// ------------------------------------------------------------ list rows
export function HellRow({ name, on, alt, onPress }: { name: string; on: boolean; alt: boolean; onPress: () => void }) {
  const solidBg = on ? '#FF4A00' : alt ? '#7A0E00' : '#5A0A00';
  const tintBg = on ? 'rgba(255, 74, 0, 0.68)' : alt ? 'rgba(122, 14, 0, 0.72)' : 'rgba(90, 10, 0, 0.72)';

  return (
    <Pressable onPress={onPress} style={[h.row, { backgroundColor: solidBg }]}>
      {HA.rowTile && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <RepeatingGif source={HA.rowTile} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: tintBg }]} />
        </View>
      )}
      <Text style={h.rowIcon}>{on ? '🔥' : '🧊'}</Text>
      <Text style={[h.rowName, on && h.rowNameOn]} numberOfLines={1}>{name}</Text>
      <Text style={[h.rowTag, on && { color: hc.flame }]}>{on ? 'CONDEMNED' : 'spared'}</Text>
    </Pressable>
  );
}

export function HellEmpty() {
  return (
    <View style={[h.row, { backgroundColor: '#5A0A00' }]}>
      {HA.rowTile && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <RepeatingGif source={HA.rowTile} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(90, 10, 0, 0.72)' }]} />
        </View>
      )}
      <Text style={h.rowIcon}>💨</Text>
      <Text style={[h.rowName, { flex: 1 }]}>Nothing here but ash. Tap "load installed apps".</Text>
    </View>
  );
}

// ------------------------------------------------------------ footer
export function HellFooter() {
  return (
    <View style={h.footer}>
      <HellBackdrop />
      <FlameStrip count={10} size={22} />
      <Text style={h.glad}>I am glad to inform you that this site no longer exists.</Text>
      <FireTitle text="THE END" size={40} />
      <Text style={h.itsEnd}>Its the end!!!</Text>
      <HellButton
        label="button that does nothing"
        onPress={() => Linking.openURL(FRIEND_INSTAGRAM_URL).catch(() => {})}
      />
      <View style={h.footScene}>
        <Fire char="🌋" size={46} source={HA.volcano} ms={900} min={0.95} />
        <Fire char="😈" size={40} source={HA.devil} ms={800} min={0.95} />
      </View>
    </View>
  );
}

const h = StyleSheet.create({
  zone: { overflow: 'hidden', backgroundColor: hc.lava, paddingTop: 14, paddingBottom: 22, paddingHorizontal: 16, gap: 12 },
  ring: { position: 'absolute', top: -6, right: -8, width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: '#FFB000', backgroundColor: '#7A0A00', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  url: { fontFamily: 'Almendra_400Regular', fontSize: 15, color: '#FFF', textDecorationLine: 'underline', alignSelf: 'flex-end', marginTop: 2 },
  oval: { alignSelf: 'center', width: '92%', minHeight: 84, borderRadius: 60, borderWidth: 4, borderColor: '#7A1200', backgroundColor: 'rgba(60,0,0,0.45)', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 18 },
  welcome: { fontFamily: 'Almendra_700Bold_Italic', fontSize: 32, color: hc.flame, textShadowColor: '#7A0A00', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  sub: { fontFamily: 'Almendra_700Bold_Italic', fontSize: 16, color: '#FFF', textAlign: 'center' },
  sceneRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  skullRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 4, borderColor: '#8A1A00', backgroundColor: '#C23000', alignItems: 'center', justifyContent: 'center' },
  tiny: { fontFamily: 'Almendra_400Regular', fontSize: 12, color: '#FFE6B0', textAlign: 'center', marginTop: -6 },
  btn: { backgroundColor: '#D8503A', borderWidth: 4, borderTopColor: '#FF9A80', borderLeftColor: '#FF9A80', borderRightColor: '#7A1000', borderBottomColor: '#7A1000', paddingVertical: 10, alignItems: 'center' },
  btnText: { fontFamily: 'Almendra_700Bold', fontSize: 20, color: '#000' },
  newTag: { position: 'absolute', top: -10, right: 6, fontFamily: 'sans-serif', fontStyle: 'italic', fontWeight: 'bold', fontSize: 18, color: '#000', textShadowColor: hc.flame, textShadowOffset: { width: 1.5, height: 1.5 }, textShadowRadius: 0, transform: [{ rotate: '-8deg' }] },
  input: { backgroundColor: '#1A0000', borderWidth: 3, borderColor: hc.flame, paddingHorizontal: 10, paddingVertical: 8, fontFamily: 'Almendra_400Regular', fontSize: 17, color: hc.flame },
  count: { fontFamily: 'Almendra_700Bold', fontSize: 18, color: hc.white, textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  row: { overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 2, borderBottomColor: '#2A0000' },
  rowIcon: { fontSize: 20 },
  rowName: { flex: 1, fontFamily: 'Almendra_400Regular', fontSize: 18, color: '#FFD9B0' },
  rowNameOn: { fontFamily: 'Almendra_700Bold', color: hc.flame, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 0 },
  rowTag: { fontFamily: 'sans-serif', fontSize: 11, fontWeight: 'bold', color: '#C98A6A' },
  footer: { overflow: 'hidden', backgroundColor: hc.lava, paddingTop: 12, paddingBottom: 24, paddingHorizontal: 16, gap: 10 },
  glad: { fontFamily: 'Almendra_400Regular', fontSize: 17, color: '#FFF', textAlign: 'center' },
  itsEnd: { fontFamily: 'MetalMania_400Regular', fontSize: 30, color: '#FFF', textAlign: 'center', marginTop: -4, letterSpacing: 1 },
  footScene: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
});