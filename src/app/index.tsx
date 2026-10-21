import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MicButton } from '@/components/mic-button';
import { Colors, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const [listening, setListening] = useState(false);
  // Assistant replies will be written here once voice recognition is wired up.
  const [response] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ASSISTANT</Text>
        <View style={styles.status}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      <View style={styles.center}>
        <MicButton listening={listening} onPress={() => setListening((value) => !value)} />
      </View>

      <View style={styles.responsePanel}>
        <Text style={styles.panelLabel}>RESPONSE</Text>
        <ScrollView contentContainerStyle={styles.responseContent}>
          <Text style={styles.responseText}>{response}</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    gap: Spacing.sm,
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responsePanel: {
    height: 160,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cyanDim,
    backgroundColor: Colors.cyanFaint,
  },
  panelLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  responseContent: {
    flexGrow: 1,
  },
  responseText: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
});
