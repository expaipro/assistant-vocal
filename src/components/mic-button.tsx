import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

const BUTTON_SIZE = 150;
const RING_SIZE = BUTTON_SIZE + 40;
const IDLE_PULSE_MS = 2600;
const LISTENING_PULSE_MS = 900;

type Props = {
  listening: boolean;
  onPress: () => void;
};

export function MicButton({ listening, onPress }: Props) {
  const pulse = useSharedValue(0);

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
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.45]) }],
  }));

  const innerRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 0.5, 1], [0.5, 1, 0.5]),
    transform: [{ scale: interpolate(pulse.value, [0, 0.5, 1], [1, 1.04, 1]) }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.ringArea}>
        <Animated.View style={[styles.ring, styles.outerRing, outerRingStyle]} />
        <Animated.View style={[styles.ring, innerRingStyle]} />
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={listening ? 'Stop listening' : 'Start listening'}
          style={({ pressed }) => [
            styles.button,
            listening && styles.buttonActive,
            pressed && styles.buttonPressed,
          ]}>
          <SymbolView
            name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
            tintColor={listening ? Colors.background : Colors.cyan}
            size={56}
          />
        </Pressable>
      </View>
      <Text style={[styles.label, listening && styles.labelActive]}>
        {listening ? 'Listening...' : 'Tap to speak'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 36,
  },
  ringArea: {
    width: RING_SIZE * 1.5,
    height: RING_SIZE * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.cyan,
    shadowColor: Colors.cyan,
    shadowOpacity: 0.9,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  outerRing: {
    borderWidth: 1,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cyanDim,
    shadowColor: Colors.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  buttonActive: {
    backgroundColor: Colors.cyan,
    borderColor: Colors.cyan,
    shadowOpacity: 1,
    shadowRadius: 36,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
  },
  label: {
    color: Colors.textMuted,
    fontSize: 15,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: Colors.cyan,
  },
});
