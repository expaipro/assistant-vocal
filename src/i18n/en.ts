// English texts. Every visible text in the app comes from here or from fr.ts.
export const en = {
  appName: 'ASSISTANT',
  status: {
    online: 'Online',
  },
  chat: {
    emptyGreeting: 'Good day. How may I be of service?',
    inputPlaceholder: 'Type a message',
    listening: 'Listening...',
    thinking: 'Thinking...',
    sendMessage: 'Send message',
    errorReply: "I'm terribly sorry, something went wrong. Please try again.",
  },
  mic: {
    startListening: 'Start listening',
    stopListening: 'Stop listening',
  },
  voice: {
    mute: 'Mute voice',
    unmute: 'Unmute voice',
  },
  language: {
    switch: 'Passer en français',
  },
};

export type Translations = typeof en;
