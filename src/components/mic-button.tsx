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

const IDLE_PULSE_MS = 2600;
const LISTENING_PULSE_MS = 900;

type Props = {
  listening: boolean;
  onPress: () => void;
  size?: number;
};

export function MicButton({ listening, onPress, size = 64 }: Props) {
  const pulse = useSharedValue(0);
  const ringSize = size + 16;

  // Restart the looping pulse whenever the state changes, faster while listening.
  useEffect(() => {
    pulse.value = 0;
    pulse.value = withRepeat(
      withTiming(1, {
        duration: listening ? LISTENING_PULSE_MS : IDLE_PULSE_MS,
        easing: Easing.out(Easing.quad),
      }),
      -1,
      false,
    );
    return () => cancelAnimation(pulse);
  }, [listening, pulse]);

  const outerRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.7, 0]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.35]) }],
  }));

  const innerRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 0.5, 1], [0.5, 1, 0.5]),
    transform: [{ scale: interpolate(pulse.value, [0, 0.5, 1], [1, 1.04, 1]) }],
  }));

  const ringShape = { width: ringSize, height: ringSize, borderRadius: ringSize / 2 };
  const buttonShape = { width: size, height: size, borderRadius: size / 2 };

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
          pressed && styles.buttonPressed,
        ]}>
        <SymbolView
          name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
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
  buttonPressed: {
    transform: [{ scale: 0.94 }],
  },
});
