import type { Translations } from './en';

// Textes français. Mêmes clés que en.ts (TypeScript signale toute clé manquante).
export const fr: Translations = {
  appName: 'ASSISTANT',
  status: {
    online: 'En ligne',
  },
  chat: {
    emptyGreeting: 'Bonjour. Que puis-je faire pour vous ?',
    inputPlaceholder: 'Écrivez un message',
    listening: 'Écoute...',
    thinking: 'Réflexion...',
    sendMessage: 'Envoyer le message',
    errorReply: 'Je suis navré, un incident est survenu. Veuillez réessayer.',
  },
  mic: {
    startListening: "Démarrer l'écoute",
    stopListening: "Arrêter l'écoute",
  },
  voice: {
    mute: 'Couper la voix',
    unmute: 'Réactiver la voix',
  },
  language: {
    switch: 'Switch to English',
  },
};
