import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MessageBubble } from '@/components/message-bubble';
import { MicButton } from '@/components/mic-button';
import { ThinkingIndicator } from '@/components/thinking-indicator';
import { Colors, Spacing } from '@/constants/theme';
import { askAssistant, type ChatMessage } from '@/services/assistant';

let nextId = 0;
function makeMessage(role: ChatMessage['role'], text: string): ChatMessage {
  nextId += 1;
  return { id: `${Date.now()}-${nextId}`, role, text };
}

export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // The home-indicator gap is only needed when the keyboard is closed.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToEnd = () => listRef.current?.scrollToEnd({ animated: true });

  async function send() {
    const text = draft.trim();
    if (!text || thinking) return;

    const userMessage = makeMessage('user', text);
    const history = [...messages, userMessage];
    setMessages(history);
    setDraft('');
    setThinking(true);

    try {
      const reply = await askAssistant(text, history);
      setMessages((current) => [...current, makeMessage('assistant', reply)]);
    } catch {
      setMessages((current) => [
        ...current,
        makeMessage('assistant', "I'm terribly sorry, something went wrong. Please try again."),
      ]);
    } finally {
      setThinking(false);
    }
  }

  const canSend = draft.trim().length > 0 && !thinking;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>ASSISTANT</Text>
          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        <FlatList
          ref={listRef}
          style={styles.flex}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToEnd}
          onLayout={scrollToEnd}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Good day. How may I be of service?</Text>
          }
          ListFooterComponent={thinking ? <ThinkingIndicator /> : null}
          ListFooterComponentStyle={styles.footer}
        />

        <View
          style={[
            styles.bottomBar,
            { paddingBottom: keyboardVisible ? Spacing.sm : insets.bottom + Spacing.sm },
          ]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder={listening ? 'Listening...' : 'Type a message'}
              placeholderTextColor={listening ? Colors.cyan : Colors.textMuted}
              selectionColor={Colors.cyan}
              keyboardAppearance="dark"
              returnKeyType="send"
              onSubmitEditing={send}
              submitBehavior="submit"
              multiline
            />
            <Pressable
              onPress={send}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              style={({ pressed }) => [
                styles.sendButton,
                !canSend && styles.sendButtonDisabled,
                pressed && styles.sendButtonPressed,
              ]}>
              <SymbolView
                name={{ ios: 'arrow.up', android: 'arrow_upward', web: 'arrow_upward' }}
                tintColor={canSend ? Colors.background : Colors.textMuted}
                size={20}
              />
            </Pressable>
          </View>

          <View style={styles.micRow}>
            <MicButton listening={listening} onPress={() => setListening((value) => !value)} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cyanFaint,
  },
  title: {
    color: Colors.cyan,
    fontSize: 26,
    fontWeight: '300',
    letterSpacing: 10,
    textShadowColor: Colors.cyan,
    textShadowRadius: 12,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.online,
    shadowColor: Colors.online,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  statusText: {
    color: Colors.textMuted,
    fontSize: 13,
    letterSpacing: 2,
  },
  listContent: {
    flexGrow: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontSize: 15,
    letterSpacing: 1,
  },
  footer: {
    marginTop: 0,
  },
  bottomBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cyanFaint,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.cyanDim,
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cyan,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cyanFaint,
  },
  sendButtonPressed: {
    transform: [{ scale: 0.92 }],
  },
  micRow: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
