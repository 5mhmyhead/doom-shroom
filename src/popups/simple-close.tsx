import { Pressable, Text, View } from 'react-native';
import type { PopupProps } from './types';

export default function SimpleClose({ onSolve, level }: PopupProps) {
  return (
    <View>
      <Text>!</Text>
      <Text>
        Interruption test. Click the button below to close this notice.
      </Text>
      <Text>
        DOOM_SHROOM.EXE has temporarily halted your scrolling session.
      </Text>
      <Text>STATUS: AWAITING_USER_CLICK</Text>
      <Pressable onPress={onSolve}>
        <Text>Close Popup</Text>
      </Pressable>
    </View>
  );
}