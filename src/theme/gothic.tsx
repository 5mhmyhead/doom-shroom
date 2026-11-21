import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, Image, ImageSourcePropType, Pressable, StyleSheet, Text, TextStyle, useWindowDimensions, View,
} from 'react-native';
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import { ASSETS } from './gothicAssets';

const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

export const goth = {
  black: '#050505',
  coal: '#0E0E0E',
  iron: '#1A1A1A',
  blood: '#D00000',
  darkBlood: '#5A0000',
  bone: '#E8E0B0',
  ash: '#8A8A8A',
  ember: '#FF7A00',
};

export type PermState = { overlay: boolean; usageStats: boolean; notifications: boolean };

// ------------------------------------------------------------ backgrounds
export function Tiled({
  source,
  fallback = goth.coal,
  dim = 0,
  scale = 1,
}: {
  source: ImageSourcePropType | null;
  fallback?: string;
  dim?: number;
  scale?: number;
}) {
  const [box, setBox] = useState({ w: 0, h: 0 });

  const scaledW = box.w / scale;
  const scaledH = box.h / scale;

  return (
    <View
      pointerEvents="none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== box.w || height !== box.h) {
          setBox({ w: width, h: height });
        }
      }}
      style={[StyleSheet.absoluteFill, { backgroundColor: fallback, overflow: 'hidden' }]}
    >
      {source && box.w > 0 && box.h > 0 && (
        <Image
          source={source}
          resizeMode="repeat"
          style={
            scale === 1
              ? { width: box.w, height: box.h }
              : {
                  position: 'absolute',
                  width: scaledW,
                  height: scaledH,
                  left: (box.w - scaledW) / 2,
                  top: (box.h - scaledH) / 2,
                  transform: [{ scale }],
                }
          }
        />
      )}
      {dim > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${dim})` }]} />}
    </View>
  );
}

export function GothicGraniteSection({ children }: { children: ReactNode }) {
  const { height } = useWindowDimensions();

  return (
    <View style={[g.graniteWrap, { minHeight: height + 24 }]}>
      <Tiled source={ASSETS.granite} fallback={goth.coal} dim={0.25} />
      {children}
    </View>
  );
}

// ------------------------------------------------------------ motion
export function Flicker({ children, min = 0.5 }: { children: ReactNode; min?: number }) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let stop = false;
    const tick = () => {
      if (stop) return;
      Animated.timing(v, {
        toValue: min + Math.random() * (1 - min),
        duration: 70 + Math.random() * 170,
        useNativeDriver: true,
      }).start(tick);
    };
    tick();
    return () => {
      stop = true;
      v.stopAnimation();
    };
  }, [min]);
  return <Animated.View style={{ opacity: v }}>{children}</Animated.View>;
}

export function GothSprite({
  char,
  size = 40,
  kind = 'sway',
  source,
  ms,
}: {
  char?: string;
  size?: number;
  kind?: 'sway' | 'pulse' | 'bob';
  source?: ImageSourcePropType | null;
  ms?: number;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: ms ?? 2600, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [ms]);

  const transform: any =
    kind === 'sway'
      ? [{ rotate: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-7deg', '7deg', '-7deg'] }) }]
      : kind === 'pulse'
      ? [{ scale: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.18, 1] }) }]
      : [{ translateY: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -6, 0] }) }];

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

// ------------------------------------------------------------ blood title
export function BloodTitle({
  text,
  size = 44,
  source,
  height = 100,
}: {
  text: string;
  size?: number;
  source?: ImageSourcePropType | null;
  height?: number;
}) {
  if (source) {
    const resolved = Image.resolveAssetSource(source);
    const aspectRatio =
      resolved?.width && resolved?.height ? resolved.width / resolved.height : undefined;

    return (
      <View style={{ alignItems: 'center' }}>
        <ExpoImage
          source={source as ExpoImageProps['source']}
          contentFit="contain"
          style={aspectRatio ? { width: '100%', aspectRatio } : { width: '100%', height }}
        />
      </View>
    );
  }

  const base: TextStyle = { fontFamily: 'serif', fontSize: size, fontWeight: 'bold', letterSpacing: 2 };
  return (
    <View style={{ alignItems: 'center' }}>
      <View>
        {[3, 2, 1].map((i) => (
          <Text
            key={i}
            numberOfLines={1}
            style={[base, { position: 'absolute', left: i, top: i, color: i === 3 ? '#000' : goth.darkBlood }]}
          >
            {text}
          </Text>
        ))}
        <Text numberOfLines={1} style={[base, { color: goth.blood }]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

// ------------------------------------------------------------ section 1: masthead
export function GothicMasthead({ interruptions }: { interruptions: number }) {
  return (
    <View style={g.mast}>
      <View style={g.topSpacer} />

      <BloodTitle text="DOOM SHROOM" size={42} source={ASSETS.title} />

      <Text style={g.script}>Dear Doomscroller,</Text>
      <Text style={g.script}>please scroll at your own risk.</Text>

      <View style={g.torchSpacer} />

      <View style={g.visited}>
        <Text style={g.visitedSmall}>You are visited.</Text>
        <Text style={g.visitedCount}>{interruptions} stops</Text>
        <Flicker min={0.6}>
          <Text style={g.beware}>BEWARE</Text>
        </Flicker>
      </View>

      <View pointerEvents="none" style={g.topSpritesOverlay}>
        <Flicker>
          <GothSprite char="🕯️" kind="bob" size={92} source={ASSETS.candle} />
        </Flicker>
        <GothSprite char="👁️" kind="pulse" size={88} source={ASSETS.eye} ms={3200} />
        <GothSprite char="💀" kind="sway" size={105} source={ASSETS.skull} />
      </View>

      <View pointerEvents="none" style={g.torchSpritesOverlay}>
        <GothSprite char="🔥" kind="bob" size={125} source={ASSETS.torch} ms={1400} />
        <GothSprite char="☠️" kind="pulse" size={82} source={ASSETS.bones} ms={4000} />
        <GothSprite char="🔥" kind="bob" size={125} source={ASSETS.torch} ms={1700} />
      </View>
    </View>
  );
}

// ------------------------------------------------------------ section 1b: permissions
const GothLink = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable onPress={onPress}>
    {({ pressed }) => <Text style={[g.link, pressed && { color: goth.blood }]}>{label}</Text>}
  </Pressable>
);

const GothPerm = ({ label, ok }: { label: string; ok: boolean }) => {
  const iconSource = ok ? ASSETS.permCandle : ASSETS.permSkull;

  const row = (
    <View style={g.permRow}>
      {iconSource ? (
        <ExpoImage
          source={iconSource as ExpoImageProps['source']}
          contentFit="contain"
          style={g.permIcon}
        />
      ) : (
        <Text style={g.perm}>{ok ? '🕯️' : '💀'}</Text>
      )}
      <Text style={g.perm}>
        {label}
        {' — '}
        <Text style={{ color: ok ? goth.bone : goth.blood, fontWeight: 'bold' }}>
          {ok ? 'GRANTED' : 'MISSING'}
        </Text>
      </Text>
    </View>
  );

  return ok ? row : <Flicker min={0.45}>{row}</Flicker>;
};

export function GothicPermissions({
  perm,
  onOverlay,
  onUsage,
  onNotify,
  onRefresh,
}: {
  perm: PermState;
  onOverlay: () => void;
  onUsage: () => void;
  onNotify: () => void;
  onRefresh: () => void;
}) {
  return (
    <View style={g.frame}>
      <View style={g.pane}>
        <Tiled source={ASSETS.tilePane} fallback={goth.black} dim={0.35} scale={0.25} />
        <Text style={g.sectionTitle}>Permissions</Text>
        <GothPerm label="Display over other apps" ok={perm.overlay} />
        <GothPerm label="Usage access" ok={perm.usageStats} />
        <GothPerm label="Notifications" ok={perm.notifications} />
        <View style={{ height: 6 }} />
        <GothLink label="open Display over other apps" onPress={onOverlay} />
        <GothLink label="open Usage access" onPress={onUsage} />
        <GothLink label="allow Notifications" onPress={onNotify} />
        <GothLink label="refresh" onPress={onRefresh} />
      </View>
    </View>
  );
}

const g = StyleSheet.create({
  graniteWrap: {
    overflow: 'hidden',
    backgroundColor: goth.coal,
    justifyContent: 'space-between',
    paddingBottom: 124,
    borderBottomWidth: 6,
    borderBottomColor: '#333',
  },
  mast: {
    overflow: 'hidden',
    paddingTop: 44,
    paddingBottom: 20,
    paddingHorizontal: 14,
  },
  topSpacer: { height: 54, marginBottom: 6 },
  torchSpacer: { height: 60, marginTop: 12 },
  topSpritesOverlay: {
    position: 'absolute',
    top: 14,
    left: -10,
    right: -10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  torchSpritesOverlay: {
    position: 'absolute',
    bottom: 52,
    left: -14,
    right: -14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  script: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: 30,
    color: goth.blood,
    textAlign: 'center',
    lineHeight: 36,
  },
  visited: { alignItems: 'center', marginTop: 10 },
  visitedSmall: { fontFamily: 'sans-serif', fontSize: 13, color: goth.blood },
  visitedCount: { fontFamily: 'sans-serif', fontSize: 13, color: '#FFFFFF' },
  beware: { fontFamily: 'serif', fontSize: 26, fontWeight: 'bold', color: goth.blood, letterSpacing: 3 },
  frame: {
    margin: 14,
    borderWidth: 10,
    borderTopColor: '#8C8C8C',
    borderLeftColor: '#8C8C8C',
    borderRightColor: '#262626',
    borderBottomColor: '#262626',
    backgroundColor: '#3A3A3A',
  },
  pane: {
    overflow: 'hidden',
    backgroundColor: goth.black,
    padding: 12,
    gap: 4,
    borderWidth: 2,
    borderColor: '#000',
  },
  sectionTitle: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: 34,
    lineHeight: 40,
    color: goth.blood,
    marginBottom: 6,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  permIcon: {
    width: 20,
    height: 20,
  },
  perm: { fontFamily: 'serif', fontSize: 16, color: '#C9C3A0' },
  link: { fontFamily: 'serif', fontSize: 16, color: goth.ash, textDecorationLine: 'underline' },
});