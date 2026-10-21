// Tiny translation system: the current language, remembered between launches,
// and the matching texts. Screens use `useTranslation()`.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { useSyncExternalStore } from 'react';

import { en, type Translations } from './en';
import { fr } from './fr';

export type Language = 'fr' | 'en';

/** Labels of the FR / EN switch (identical in both languages). */
export const LANGUAGE_LABELS: Record<Language, string> = { fr: 'FR', en: 'EN' };

const STORAGE_KEY = 'app.language';
const TRANSLATIONS: Record<Language, Translations> = { fr, en };

function deviceLanguage(): Language {
  return getLocales()[0]?.languageCode === 'fr' ? 'fr' : 'en';
}

// Phone language until the user picks one with the FR / EN button.
let language: Language = deviceLanguage();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((stored) => {
    if ((stored === 'fr' || stored === 'en') && stored !== language) {
      language = stored;
      notify();
    }
  })
  .catch(() => {});

export function getLanguage(): Language {
  return language;
}

export async function setLanguage(next: Language) {
  if (next !== language) {
    language = next;
    notify();
  }
  try {
    await AsyncStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Not critical: the choice just won't survive a restart.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Current language and its texts; re-renders when the language changes. */
export function useTranslation() {
  const current = useSyncExternalStore(subscribe, getLanguage);
  return { language: current, t: TRANSLATIONS[current], setLanguage };
}
