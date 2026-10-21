import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

export type MicMode = 'idle' | 'listening' | 'speaking';

const IDLE_PULSE_MS = 2600;
const LISTENING_PULSE_MS = 900;
const SPEAKING_PULSE_MS = 420;

type Props = {
  mode: MicMode;
  onPress: () => void;
  size?: number;
};

export function MicButton({ mode, onPress, size = 64 }: Props) {
  const pulse = useSharedValue(0);
  // 1 while speaking: rings "vibrate" back and forth instead of expanding outward.
  const speaking = useSharedValue(0);
  const ringSize = size + 16;

  // Restart the looping animation whenever the mode changes.
  useEffect(() => {
    const isSpeaking = mode === 'speaking';
    speaking.value = isSpeaking ? 1 : 0;
    pulse.value = 0;
    const duration =
      mode === 'speaking' ? SPEAKING_PULSE_MS : mode === 'listening' ? LISTENING_PULSE_MS : IDLE_PULSE_MS;
    pulse.value = withRepeat(
      withTiming(1, {
        duration,
        easing: isSpeaking ? Easing.inOut(Easing.sin) : Easing.out(Easing.quad),
      }),
      -1,
      isSpeaking,
    );
    return () => cancelAnimation(pulse);
  }, [mode, pulse, speaking]);

  const outerRingStyle = useAnimatedStyle(() =>
    speaking.value
      ? {
          opacity: interpolate(pulse.value, [0, 1], [0.35, 0.9]),
          transform: [{ scale: interpolate(pulse.value, [0, 1], [1.02, 1.2]) }],
        }
      : {
          opacity: interpolate(pulse.value, [0, 1], [0.7, 0]),
          transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.35]) }],
        },
  );

  const innerRingStyle = useAnimatedStyle(() =>
    speaking.value
      ? {
          opacity: 1,
          transform: [{ scale: interpolate(pulse.value, [0, 1], [1.06, 0.98]) }],
        }
      : {
          opacity: interpolate(pulse.value, [0, 0.5, 1], [0.5, 1, 0.5]),
          transform: [{ scale: interpolate(pulse.value, [0, 0.5, 1], [1, 1.04, 1]) }],
        },
  );

  const ringShape = { width: ringSize, height: ringSize, borderRadius: ringSize / 2 };
  const buttonShape = { width: size, height: size, borderRadius: size / 2 };
  const listening = mode === 'listening';

  return (
    <View style={[styles.ringArea, ringShape]}>
      <Animated.View style={[styles.ring, ringShape, styles.outerRing, outerRingStyle]} />
      <Animated.View style={[styles.ring, ringShape, innerRingStyle]} />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={listening ? 'Stop listening' : 'Start listening'}
        style={({ pressed }) => [
          styles.button,
          buttonShape,
          listening && styles.buttonActive,
          mode === 'speaking' && styles.buttonSpeaking,
          pressed && styles.buttonPressed,
        ]}>
        <SymbolView
          name={
            mode === 'speaking'
              ? { ios: 'waveform', android: 'graphic_eq', web: 'graphic_eq' }
              : { ios: 'mic.fill', android: 'mic', web: 'mic' }
          }
          tintColor={listening ? Colors.background : Colors.cyan}
          size={size * 0.4}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ringArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.cyan,
    shadowColor: Colors.cyan,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  outerRing: {
    borderWidth: 1,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cyanDim,
    shadowColor: Colors.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  buttonActive: {
    backgroundColor: Colors.cyan,
    borderColor: Colors.cyan,
    shadowOpacity: 1,
    shadowRadius: 24,
  },
  buttonSpeaking: {
    borderColor: Colors.cyan,
    shadowOpacity: 0.9,
    shadowRadius: 22,
  },
  buttonPressed: {
    transform: [{ scale: 0.94 }],
  },
});
