import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  appName,
  reason,
  level,
  forceIndex,
  onSolved,
  onEscape,
}: Props) {
  const Popup = useMemo(() => {
    const i = forceIndex ?? Math.floor(Math.random() * popups.length);
    return popups[i].Component;
  }, [forceIndex]);

  const headline =
    reason === 'expired' ? 'Your time is up.' : `${appName} is currently closed.`;

  return (
    <View style={s.backdrop}>
      <View style={s.card}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text style={s.headline}>{headline}</Text>
          <Text style={s.base}>
            You have been selected. Level {level}. Complete the prompt below to continue to {appName}.
          </Text>

          <Popup onSolve={onSolved} level={level} />

          <View style={s.footer}>
            <Text style={s.meta}>Level {level}</Text>
            <Pressable onLongPress={onEscape} delayLongPress={4000} style={s.escape}>
              <Text style={s.meta}>.</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    padding: 16,
    maxHeight: '85%',
  },
  content: {
    gap: 10,
  },
  headline: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  base: {
    fontFamily: 'serif',
    fontSize: 16,
    color: '#000000',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  meta: {
    fontFamily: 'serif',
    fontSize: 12,
    color: '#666666',
  },
  escape: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});