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

- **No AI API is connected yet** (no Anthropic key). The assistant's replies are fake, canned butler-style answers,
  now generated **server-side** by the Supabase Edge Function `assistant`.
- The mic button is visual only (no speech recognition yet).
- **The assistant reads every reply aloud** (text-to-speech via `expo-speech`, built-in iOS voices).

# Voice (text-to-speech)

- All speech goes through `src/services/voice.ts` (`speak`, `stopSpeaking`, `setVoiceEnabled`); screens read its state with
  `useVoice()` (`src/hooks/use-voice.ts`). To move to a premium voice later, change only `voice.ts`.
- Voice choice: first calm English male voice found on the phone (Daniel, Arthur, Oliver, Aaron...), enhanced/premium
  quality preferred; otherwise the default `en-GB` voice. Rate 0.9, pitch 0.95.
- Sending a new message (or tapping the mic) stops the current speech.
- Mute button (top right) is remembered between launches with AsyncStorage (key `voice.enabled`).
- While speaking, the mic ring switches to a fast back-and-forth "vibration" with a waveform icon (`MicButton` mode `speaking`),
  distinct from the outward pulse of `listening`.
- iOS: no sound when the phone's silent mode is on (expected `expo-speech` behaviour).

# Architecture

```
Screen (src/app/index.tsx)
  -> askAssistant()            src/services/assistant.ts   (only entry point; screens never call the server directly)
  -> supabase.functions.invoke src/lib/supabase.ts          (sends the publishable key in the `apikey` header)
  -> Edge Function "assistant" supabase/functions/assistant/index.ts (Deno, runs on Supabase)
```

- Request body: `{ message: string, history: { role, text }[] }`. Response: `{ reply: string }`, or `{ error }` with a 4xx status.
- The function uses `withSupabase({ auth: "publishable" })` from `@supabase/server`, so it only accepts calls carrying the
  project's publishable key; `verify_jwt = false` in `supabase/config.toml` (publishable keys are not JWTs).
- On failure (no network, server down, 15 s timeout, bad config), `askAssistant` throws and the screen shows a polite error bubble.
- Next step: replace the fake replies in the Edge Function with the real Claude call. The Anthropic key must be stored as a
  Supabase secret (`npx supabase secrets set ...`), never in the app or in `.env`.

# Configuration

- `.env` (git-ignored) holds `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `.env.example` documents them without values.
- Only public values may use the `EXPO_PUBLIC_` prefix: they are bundled into the app. No secret / service-role key in the app, ever.
- Supabase CLI is used through `npx supabase ...` (no global install). Docker is not installed, so functions are tested
  on the hosted project, not locally.
- Commands that need the owner (login, link, deploy): give the exact command and wait for them to run it.
  - `npx supabase login`
  - `npx supabase link --project-ref <project-ref>`
  - `npx supabase functions deploy assistant`

# Structure

- `src/app/` — screens (Expo Router). Currently a single conversation screen: `index.tsx`.
- `src/components/` — reusable components (`mic-button.tsx`, `message-bubble.tsx`, `thinking-indicator.tsx`).
- `src/services/assistant.ts` — the app-side entry point to the assistant.
- `src/services/voice.ts` — the assistant's spoken voice (text-to-speech).
- `src/hooks/use-voice.ts` — React hook exposing the voice state (muted, speaking).
- `src/lib/supabase.ts` — Supabase client (no user sessions yet).
- `src/constants/theme.ts` — HUD colors and spacing.
- `supabase/` — Supabase project config (`config.toml`) and Edge Functions (`functions/assistant/`).
