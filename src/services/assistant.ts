// Single entry point between the screens and the assistant "brain".
// Today it returns canned butler-style replies. Later, replace the body of
// `askAssistant` with the real call to Claude through Supabase — screens
// only depend on this function's signature, so they won't need to change.

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

const FAKE_DELAY_MS = 1000;

const FAKE_REPLIES = [
  'Very good, sir. I have taken note of your request and shall attend to it at once.',
  'An excellent question. Allow me a moment to consult the markets on your behalf.',
  'Certainly. Might I suggest we review your open positions before the session closes?',
  'Of course. Rest assured, I am keeping a watchful eye on volatility this morning.',
  'Understood. I shall have a full briefing prepared for you shortly.',
  'With pleasure. Shall I also set an alert, should the price reach your target?',
];

let lastReplyIndex = -1;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function pickReply() {
  let index = Math.floor(Math.random() * FAKE_REPLIES.length);
  if (index === lastReplyIndex) {
    index = (index + 1) % FAKE_REPLIES.length;
  }
  lastReplyIndex = index;
  return FAKE_REPLIES[index];
}

/**
 * Sends the user's message (plus the conversation so far) to the assistant
 * and resolves with the assistant's reply text.
 */
export async function askAssistant(message: string, history: ChatMessage[]): Promise<string> {
  await wait(FAKE_DELAY_MS);
  return pickReply();
}
