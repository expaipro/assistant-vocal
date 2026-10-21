// Single entry point for the assistant's spoken voice.
// Today it uses the phone's built-in text-to-speech (expo-speech). To switch to a
// premium voice later, only this file needs to change: screens just call
// speak() / stopSpeaking() / setVoiceEnabled() and read the state via useVoice().

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

export type VoiceState = {
  /** The user's choice (mute button), remembered between launches. */
  enabled: boolean;
  /** True while the assistant is actually speaking. */
  speaking: boolean;
};

const STORAGE_KEY = 'voice.enabled';
const FALLBACK_LANGUAGE = 'en-GB';
// Slightly slower and lower than normal, for a calm butler tone.
const RATE = 0.9;
const PITCH = 0.95;

// Calm English male voices shipped with iOS, best first.
const PREFERRED_MALE_VOICES = ['Daniel', 'Arthur', 'Oliver', 'Aaron', 'Evan', 'Nathan', 'Tom', 'Alex', 'Gordon', 'Lee'];

let state: VoiceState = { enabled: true, speaking: false };
const listeners = new Set<() => void>();
let currentUtterance = 0;
let voicePromise: Promise<string | undefined> | null = null;

function setState(patch: Partial<VoiceState>) {
  const next = { ...state, ...patch };
  if (next.enabled === state.enabled && next.speaking === state.speaking) return;
  state = next;
  listeners.forEach((listener) => listener());
}

const preferenceLoaded = AsyncStorage.getItem(STORAGE_KEY)
  .then((value) => {
    if (value === 'false') setState({ enabled: false });
  })
  .catch(() => {});

async function findMaleVoice(): Promise<string | undefined> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Skip iOS novelty voices (Eloquence, "Bad News", "Zarvox"...).
    const english = voices.filter(
      (voice) =>
        voice.language.toLowerCase().startsWith('en') &&
        !/eloquence|speech\.synthesis/i.test(voice.identifier),
    );
    const best = (candidates: Speech.Voice[]) =>
      candidates.find((voice) => /premium/i.test(voice.identifier)) ??
      candidates.find((voice) => voice.quality === Speech.VoiceQuality.Enhanced) ??
      candidates[0];

    for (const name of PREFERRED_MALE_VOICES) {
      const matches = english.filter((voice) => voice.name.startsWith(name));
      if (matches.length > 0) return best(matches).identifier;
    }
    const siriMale = english.filter((voice) => /(^|[^e])male/i.test(voice.identifier));
    if (siriMale.length > 0) return best(siriMale).identifier;
  } catch {
    // Fall through to the default English voice.
  }
  return undefined;
}

export function getVoiceState(): VoiceState {
  return state;
}

export function subscribeToVoice(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Stops any speech in progress (e.g. when the user sends a new message). */
export function stopSpeaking() {
  currentUtterance += 1;
  setState({ speaking: false });
  void Speech.stop();
}

/** Reads `text` aloud, unless the voice is muted. Replaces any speech in progress. */
export async function speak(text: string) {
  stopSpeaking();
  const utterance = currentUtterance;

  await preferenceLoaded;
  if (!state.enabled) return;

  voicePromise ??= findMaleVoice();
  const voice = await voicePromise;
  // Stopped or replaced by a newer message while we were preparing.
  if (utterance !== currentUtterance || !state.enabled) return;

  const isCurrent = () => utterance === currentUtterance;
  const finish = () => {
    if (isCurrent()) setState({ speaking: false });
  };

  Speech.speak(text, {
    voice,
    language: FALLBACK_LANGUAGE,
    rate: RATE,
    pitch: PITCH,
    onStart: () => {
      if (isCurrent()) setState({ speaking: true });
    },
    onDone: finish,
    onStopped: finish,
    onError: finish,
  });
}

/** Mute / unmute the assistant's voice, remembered for the next launch. */
export async function setVoiceEnabled(enabled: boolean) {
  setState({ enabled });
  if (!enabled) stopSpeaking();
  try {
    await AsyncStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // Not critical: the choice just won't survive a restart.
  }
}
