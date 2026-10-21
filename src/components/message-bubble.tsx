import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import type { ChatMessage } from '@/services/assistant';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubble, isUser ? styles.user : styles.assistant]}>
      <Text style={[styles.text, isUser && styles.userText]}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: 16,
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.userBubble,
    borderBottomRightRadius: 4,
  },
  assistant: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cyanDim,
    borderBottomLeftRadius: 4,
    shadowColor: Colors.cyan,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  text: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
});
