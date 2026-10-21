// Single entry point between the screens and the assistant "brain".
// The brain lives server-side in the Supabase Edge Function "assistant"
// (supabase/functions/assistant). Screens only depend on this function's
// signature, so the server can change (e.g. real Claude call) without
// touching them.

import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';

import { getSupabase } from '@/lib/supabase';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

const REQUEST_TIMEOUT_MS = 15000;

/**
 * Sends the user's message (plus the conversation so far) to the assistant
 * and resolves with the assistant's reply text.
 * Throws when the server can't be reached or fails; the screen then shows
 * its polite error message.
 */
export async function askAssistant(message: string, history: ChatMessage[]): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('Supabase is not configured: fill in .env (see .env.example).');
    throw new Error('The assistant is not configured yet.');
  }

  const { data, error } = await supabase.functions.invoke<{ reply?: string }>('assistant', {
    body: {
      message,
      history: history.map(({ role, text }) => ({ role, text })),
    },
    timeout: REQUEST_TIMEOUT_MS,
  });

  if (error) {
    console.warn('Assistant request failed:', error);
    if (error instanceof FunctionsFetchError || error instanceof FunctionsRelayError) {
      throw new Error('The server is not responding. Please check your connection.');
    }
    if (error instanceof FunctionsHttpError) {
      throw new Error('The server could not handle the request.');
    }
    throw new Error('The assistant is unavailable right now.');
  }

  if (!data?.reply) {
    throw new Error('The server sent an empty reply.');
  }
  return data.reply;
}
