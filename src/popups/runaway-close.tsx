import { useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import { FA } from '../theme/forestAssets';
import type { PopupProps } from './types';

const SIZE = 40;
const BORDER_PAD = 8;

const fc = {
  canopy: '#0A2111',
  deep: '#12361C',
  moss: '#1E522B',
  leaf: '#499E46',
  lime: '#A6FF5E',
  bark: '#4F3019',
  barkLight: '#9C683E',
  barkDark: '#241307',
  parchment: '#F5F1D8',
  gold: '#FFE666',
};

const TAUNTS = [
  'Too slow, mortal!',
  'Over here in the ferns!',
  'Catch the pixie to close!',
  'Almost had it!',
  'Flittering deeper into the woods...',
];

// ------------------------------------------------------------ tiled forest backdrop
function RepeatingTile({
  source,
  tint,
}: {
  source: ImageSourcePropType;
  tint?: string;
}) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const resolved = Image.resolveAssetSource(source);
  const tileW = Math.max(32, resolved?.width || 64);
  const tileH = Math.max(32, resolved?.height || 64);

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
        <View
          style={{
            width: cols * tileW,
            height: rows * tileH,
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}
        >
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
      {tint ? <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} /> : null}
    </View>
  );
}

// Layered woodland title matching the retro extruded header style
function ForestTitle({ text, size = 34 }: { text: string; size?: number }) {
  const base = { fontFamily: 'Fondamento_400Regular', fontSize: size, letterSpacing: 1.5 };
  const layers: [number, string][] = [
    [4, '#07170C'],
    [3, '#13381D'],
    [2, '#245E32'],
    [1, '#499E46'],
  ];

  return (
    <View style={{ alignSelf: 'center', paddingRight: 5, paddingBottom: 5 }}>
      {layers.map(([i, c]) => (
        <Text
          key={i}
          numberOfLines={1}
          style={[base, { position: 'absolute', left: i, top: i, color: c }]}
        >
          {text}
        </Text>
      ))}
      <Text numberOfLines={1} style={[base, { color: fc.gold }]}>
        {text}
      </Text>
    </View>
  );
}

// ------------------------------------------------------------ runaway close challenge
export default function RunawayClose({ onSolve, level }: PopupProps) {
  const totalTaps = 3 + level;
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const [tapsLeft, setTapsLeft] = useState(totalTaps);
  const [statusMsg, setStatusMsg] = useState('CHASING_PIXIE_CLOSE');
  const solved = useRef(false);

  const randomPos = (b: { w: number; h: number }) => ({
    x: BORDER_PAD + Math.random() * Math.max(1, b.w - SIZE - BORDER_PAD * 2),
    y: BORDER_PAD + Math.random() * Math.max(1, b.h - SIZE - BORDER_PAD * 2),
  });

  useEffect(() => {
    if (!box.w) return;
    setPos(randomPos(box));
    const id = setInterval(() => {
      setPos(randomPos(box));
    }, 1100);
    return () => clearInterval(id);
  }, [box]);

  const onPress = () => {
    if (solved.current) return;
    const next = tapsLeft - 1;
    setTapsLeft(next);

    if (next <= 0) {
      solved.current = true;
      setStatusMsg('PIXIE_CAUGHT_CLOSING');
      onSolve();
      return;
    }

    const taunt = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
    setStatusMsg(`${taunt.toUpperCase()} (${next} LEFT)`);
    setPos(randomPos(box));
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== box.w || height !== box.h) {
      setBox({ w: width, h: height });
    }
  };

  return (
    <View style={s.root}>
      {FA.grass ? (
        <RepeatingTile source={FA.grass} tint="rgba(10, 33, 17, 0.72)" />
      ) : null}

      <ScrollView
        contentContainerStyle={s.scroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Forest Header */}
        <View style={s.header}>
          <View style={s.urlRow}>
            {FA.leaf ? (
              <ExpoImage
                source={FA.leaf as ExpoImageProps['source']}
                contentFit="contain"
                style={{ width: 20, height: 20 }}
              />
            ) : (
              <Text>🍃</Text>
            )}
            <Text style={s.url}>www.deepwoods.net/sponsor-ad</Text>
            {FA.sparkle ? (
              <ExpoImage
                source={FA.sparkle as ExpoImageProps['source']}
                contentFit="contain"
                style={{ width: 20, height: 20 }}
              />
            ) : (
              <Text>✨</Text>
            )}
          </View>

          <View style={{ marginTop: 2 }}>
            <ForestTitle text="WOODLAND AD" size={34} />
            <View style={s.critterBadge}>
              {FA.toucan ? (
                <ExpoImage
                  source={FA.toucan as ExpoImageProps['source']}
                  contentFit="contain"
                  style={{ width: 28, height: 28 }}
                />
              ) : (
                <Text style={{ fontSize: 20 }}>🦜</Text>
              )}
            </View>
          </View>

          <View style={s.scrollPlaque}>
            <Text style={s.copy}>
              A wild pop-up blocks the trail! Tap the runaway fairy{' '}
              <Text style={s.copyBold}>{totalTaps} times</Text> to close it.
            </Text>
          </View>
        </View>

        {/* Enchanted Clearing (Hopping Field) */}
        <View style={s.clearingFrame}>
          <View style={s.clearingTitleBar}>
            <Text style={s.clearingTitleText}>
              FOREST_SPONSOR.EXE — CATCH [X]
            </Text>
            <Text style={s.clearingCount}>
              {tapsLeft}/{totalTaps}
            </Text>
          </View>

          <View style={s.field} onLayout={onLayout}>
            {FA.pine ? (
              <RepeatingTile source={FA.pine} tint="rgba(9, 28, 14, 0.58)" />
            ) : null}

            {/* Lurking eyes in the dark foliage */}
            {FA.eyes ? (
              <ExpoImage
                pointerEvents="none"
                source={FA.eyes as ExpoImageProps['source']}
                contentFit="contain"
                style={s.eyesDecor}
              />
            ) : null}

            {/* Center 90s retro ad watermark */}
            <View pointerEvents="none" style={s.watermarkBox}>
              {FA.sparkle ? (
                <ExpoImage
                  source={FA.sparkle as ExpoImageProps['source']}
                  contentFit="contain"
                  style={{ width: 28, height: 28 }}
                />
              ) : null}
              <Text style={s.watermark}>*** FREE ENCHANTED ACORNS ***</Text>
              <Text style={s.watermarkSub}>
                CLICK HERE FOR 1000% MORE MOSS!
              </Text>
            </View>

            {/* Bottom corner ferns & frog */}
            {FA.fern ? (
              <ExpoImage
                pointerEvents="none"
                source={FA.fern as ExpoImageProps['source']}
                contentFit="contain"
                style={s.fernLeft}
              />
            ) : null}
            {FA.frog ? (
              <ExpoImage
                pointerEvents="none"
                source={FA.frog as ExpoImageProps['source']}
                contentFit="contain"
                style={s.frogRight}
              />
            ) : null}

            {/* Runaway Fairy [x] Target */}
            <Pressable
              onPress={onPress}
              hitSlop={6}
              style={[s.target, { left: pos.x, top: pos.y }]}
            >
              {FA.fairy ? (
                <ExpoImage
                  source={FA.fairy as ExpoImageProps['source']}
                  contentFit="contain"
                  style={{ width: 30, height: 30 }}
                />
              ) : (
                <Text style={{ fontSize: 22 }}>🧚</Text>
              )}
              <View style={s.xPill}>
                <Text style={s.xText}>x</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Bottom Woodland Status Bar & Life Pips */}
        <View style={s.footer}>
          <View style={s.pipsRow}>
            {Array.from({ length: totalTaps }, (_, i) => {
              const active = i < tapsLeft;
              return (
                <View key={i} style={[s.pip, !active && s.pipDone]}>
                  {FA.leaf ? (
                    <ExpoImage
                      source={FA.leaf as ExpoImageProps['source']}
                      contentFit="contain"
                      style={{ width: 18, height: 18, opacity: active ? 1 : 0.25 }}
                    />
                  ) : (
                    <Text style={{ opacity: active ? 1 : 0.25 }}>🍃</Text>
                  )}
                </View>
              );
            })}
          </View>

          <View style={s.statusBar}>
            <Text style={s.statusText} numberOfLines={1}>
              STATUS: {statusMsg}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: fc.canopy,
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 10,
  },
  header: {
    gap: 6,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  url: {
    fontFamily: 'PatrickHand_400Regular',
    fontSize: 15,
    color: fc.lime,
    textDecorationLine: 'underline',
  },
  critterBadge: {
    position: 'absolute',
    top: -2,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: fc.gold,
    backgroundColor: fc.moss,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scrollPlaque: {
    backgroundColor: 'rgba(18, 54, 28, 0.88)',
    borderWidth: 3,
    borderTopColor: fc.barkLight,
    borderLeftColor: fc.barkLight,
    borderRightColor: fc.barkDark,
    borderBottomColor: fc.barkDark,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  copy: {
    fontFamily: 'Fondamento_400Regular',
    fontSize: 16,
    color: fc.parchment,
    textAlign: 'center',
  },
  copyBold: {
    fontFamily: 'Fondamento_400Regular_Italic',
    color: fc.gold,
  },
  clearingFrame: {
    flex: 1,
    minHeight: 300,
    backgroundColor: fc.bark,
    borderWidth: 4,
    borderTopColor: fc.barkLight,
    borderLeftColor: fc.barkLight,
    borderRightColor: fc.barkDark,
    borderBottomColor: fc.barkDark,
    padding: 4,
  },
  clearingTitleBar: {
    backgroundColor: fc.moss,
    borderBottomWidth: 2,
    borderBottomColor: fc.barkDark,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearingTitleText: {
    fontFamily: 'Silkscreen_700Bold',
    fontSize: 10,
    color: fc.gold,
  },
  clearingCount: {
    fontFamily: 'Silkscreen_700Bold',
    fontSize: 10,
    color: fc.lime,
  },
  field: {
    flex: 1,
    minHeight: 270,
    backgroundColor: fc.deep,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  eyesDecor: {
    position: 'absolute',
    top: 12,
    left: 14,
    width: 44,
    height: 26,
    opacity: 0.85,
  },
  watermarkBox: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(10, 33, 17, 0.65)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: fc.leaf,
  },
  watermark: {
    fontFamily: 'Silkscreen_700Bold',
    fontSize: 11,
    color: fc.gold,
    textAlign: 'center',
  },
  watermarkSub: {
    fontFamily: 'PatrickHand_400Regular',
    fontSize: 14,
    color: fc.lime,
    textAlign: 'center',
  },
  fernLeft: {
    position: 'absolute',
    bottom: 4,
    left: 6,
    width: 48,
    height: 48,
  },
  frogRight: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    width: 44,
    height: 44,
  },
  target: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(30, 82, 43, 0.92)',
    borderWidth: 2,
    borderColor: fc.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xPill: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C92A1D',
    borderWidth: 1.5,
    borderColor: fc.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xText: {
    fontFamily: 'Silkscreen_700Bold',
    fontSize: 9,
    lineHeight: 11,
    color: '#FFFFFF',
  },
  footer: {
    gap: 6,
  },
  pipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: fc.moss,
    borderWidth: 2,
    borderColor: fc.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipDone: {
    backgroundColor: fc.canopy,
    borderColor: fc.bark,
  },
  statusBar: {
    backgroundColor: fc.canopy,
    borderWidth: 3,
    borderTopColor: fc.barkDark,
    borderLeftColor: fc.barkDark,
    borderRightColor: fc.barkLight,
    borderBottomColor: fc.barkLight,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  statusText: {
    fontFamily: 'Silkscreen_700Bold',
    fontSize: 10,
    color: fc.lime,
  },
});