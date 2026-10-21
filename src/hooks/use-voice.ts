import { useSyncExternalStore } from 'react';

import { getVoiceState, subscribeToVoice, type VoiceState } from '@/services/voice';

/** Live voice state (muted or not, speaking or not) for screens and components. */
export function useVoice(): VoiceState {
  return useSyncExternalStore(subscribeToVoice, getVoiceState);
}
