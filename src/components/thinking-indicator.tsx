import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Spacing } from '@/constants/theme';
import { useTranslation } from '@/i18n';

export function ThinkingIndicator() {
  const { t } = useTranslation();
  const glow = useSharedValue(0.35);

  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
    return () => cancelAnimation(glow);
  }, [glow]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Animated.View style={[styles.bubble, animatedStyle]}>
      <Text style={styles.text}>{t.chat.thinking}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.cyanDim,
    backgroundColor: Colors.surface,
  },
  text: {
    color: Colors.cyan,
    fontSize: 14,
    letterSpacing: 2,
  },
});
