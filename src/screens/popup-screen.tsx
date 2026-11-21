import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { popups } from '../popups/registry';

type Props = {
  appName: string;
  reason: string;
  level: number;
  forceIndex?: number;
  onSolved: () => void;
  onEscape: () => void;
};

export default function PopupScreen({
  level,
  forceIndex,
  onSolved,
  onEscape,
}: Props) {
  const Popup = useMemo(() => {
    const i = forceIndex ?? Math.floor(Math.random() * popups.length);
    return popups[i].Component;
  }, [forceIndex]);

  return (
    <View style={s.backdrop}>
      <Popup onSolve={onSolved} level={level} />

      {/* Invisible 4s long-press emergency exit in the bottom-right corner */}
      <Pressable onLongPress={onEscape} delayLongPress={4000} style={s.escape} />
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
  },
  escape: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
  },
});