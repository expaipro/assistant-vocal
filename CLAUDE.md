@AGENTS.md

# Project context

AI voice assistant for traders, styled as a futuristic butler (dark HUD look, glowing cyan accents).
Expo SDK 57 / React Native app, developed on Windows and tested on an iPhone through **Expo Go**.
The owner is not a developer: explain changes in plain, simple language (in French) and say what to check on the iPhone.

# Rules

- **Expo SDK 57 only.** Do not upgrade or downgrade the SDK.
- **Expo Go compatible packages only.** Never add a library that needs a custom native build / development build.
- **Install packages with `npx expo install <package>`** (never `npm install` / `yarn add` directly) so versions match SDK 57.
- **No API keys or secrets in the app code.** Any call needing a key must go through a backend/server later.
- **All user-visible text in English** (labels, buttons, messages, statuses).
- **No Marvel elements**: never use the name "Jarvis" or any Iron Man visuals, names or references.
- Run `npx expo lint` and `npx tsc --noEmit` before declaring a task done.

# État actuel

- **No AI API is connected yet** (no Anthropic key). The assistant's replies are fake, canned butler-style answers.
- All assistant logic goes through `askAssistant()` in `src/services/assistant.ts`. Screens must never call an AI directly.
  Planned: replace that function's body with the real call to Claude **via Supabase** (key kept server-side), without touching the screens.
- The mic button is visual only (no speech recognition yet).

# Structure

- `src/app/` — screens (Expo Router). Currently a single conversation screen: `index.tsx`.
- `src/components/` — reusable components (`mic-button.tsx`, `message-bubble.tsx`, `thinking-indicator.tsx`).
- `src/services/assistant.ts` — the assistant "brain" (currently fake).
- `src/constants/theme.ts` — HUD colors and spacing.
