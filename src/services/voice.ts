// Single entry point for the assistant's spoken voice.
// Today it uses the phone's built-in text-to-speech (expo-speech). To switch to a
// premium voice later, only this file needs to change: screens just call
// speak() / stopSpeaking() / setVoiceEnabled() and read the state via useVoice().

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

import type { Language } from '@/i18n';

export type VoiceState = {
  /** The user's choice (mute button), remembered between launches. */
  enabled: boolean;
  /** True while the assistant is actually speaking. */
  speaking: boolean;
};

const STORAGE_KEY = 'voice.enabled';
// Slightly slower and lower than normal, for a calm butler tone.
const RATE = 0.9;
const PITCH = 0.95;

// Per language: the default voice language, and calm male iOS voices, best first.
const VOICE_SETTINGS: Record<Language, { fallbackLanguage: string; preferredMaleVoices: string[] }> = {
  en: {
    fallbackLanguage: 'en-GB',
    preferredMaleVoices: ['Daniel', 'Arthur', 'Oliver', 'Aaron', 'Evan', 'Nathan', 'Tom', 'Alex', 'Gordon', 'Lee'],
  },
  fr: {
    fallbackLanguage: 'fr-FR',
    preferredMaleVoices: ['Thomas', 'Daniel', 'Nicolas'],
  },
};

let state: VoiceState = { enabled: true, speaking: false };
const listeners = new Set<() => void>();
let currentUtterance = 0;
const voicePromises: Partial<Record<Language, Promise<string | undefined>>> = {};

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

async function findMaleVoice(language: Language): Promise<string | undefined> {
  const { fallbackLanguage, preferredMaleVoices } = VOICE_SETTINGS[language];
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Skip iOS novelty voices (Eloquence, "Bad News", "Zarvox"...).
    const usable = voices.filter(
      (voice) =>
        voice.language.toLowerCase().startsWith(language) &&
        !/eloquence|speech\.synthesis/i.test(voice.identifier),
    );
    // For French, prefer voices from France (fr-FR) over e.g. Canada.
    const regional = usable.filter(
      (voice) => voice.language.replace('_', '-').toLowerCase() === fallbackLanguage.toLowerCase(),
    );
    const candidates = language === 'fr' && regional.length > 0 ? regional : usable;
    const best = (candidates: Speech.Voice[]) =>
      candidates.find((voice) => /premium/i.test(voice.identifier)) ??
      candidates.find((voice) => voice.quality === Speech.VoiceQuality.Enhanced) ??
      candidates[0];

    for (const name of preferredMaleVoices) {
      const matches = candidates.filter((voice) => voice.name.startsWith(name));
      if (matches.length > 0) return best(matches).identifier;
    }
    const siriMale = candidates.filter((voice) => /(^|[^e])male/i.test(voice.identifier));
    if (siriMale.length > 0) return best(siriMale).identifier;
  } catch {
    // Fall through to the default voice for the language.
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

/** Reads `text` aloud in `language`, unless the voice is muted. Replaces any speech in progress. */
export async function speak(text: string, language: Language) {
  stopSpeaking();
  const utterance = currentUtterance;

  await preferenceLoaded;
  if (!state.enabled) return;

  voicePromises[language] ??= findMaleVoice(language);
  const voice = await voicePromises[language];
  // Stopped or replaced by a newer message while we were preparing.
  if (utterance !== currentUtterance || !state.enabled) return;

  const isCurrent = () => utterance === currentUtterance;
  const finish = () => {
    if (isCurrent()) setState({ speaking: false });
  };

  Speech.speak(text, {
    voice,
    language: VOICE_SETTINGS[language].fallbackLanguage,
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
