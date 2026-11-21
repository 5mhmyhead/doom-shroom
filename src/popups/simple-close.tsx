import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PopupProps } from './types';

export default function SimpleClose({ onSolve, level }: PopupProps) {
  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.badge}>
          <Text style={s.badgeText}>!</Text>
        </View>
        <Text style={s.title}>Notice (Level {level})</Text>
      </View>

      <Text style={s.base}>
        Interruption test. Click the button below to close this notice.
      </Text>
      <Text style={s.base}>
        DOOM_SHROOM.EXE has temporarily halted your scrolling session.
      </Text>

      <Text style={s.status}>STATUS: AWAITING_USER_CLICK</Text>

      <Pressable onPress={onSolve} style={s.btn}>
        <Text style={s.btnText}>Close Popup</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    margin: 16,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 26,
    height: 26,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  title: {
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
  status: {
    fontFamily: 'serif',
    fontSize: 12,
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 8,
  },
  btn: {
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  btnText: {
    fontFamily: 'serif',
    fontSize: 16,
    color: '#0000EE',
    textDecorationLine: 'underline',
  },
});