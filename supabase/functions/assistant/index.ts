// Supabase Edge Function "assistant" — the assistant's server-side brain.
// Today it returns canned butler-style replies. Later, this is where the real
// call to Claude goes (with the Anthropic key stored as a Supabase secret,
// never in the app).

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const FAKE_DELAY_MS = 1000;

const FAKE_REPLIES = [
  "Very good, sir. I have taken note of your request and shall attend to it at once.",
  "An excellent question. Allow me a moment to consult the markets on your behalf.",
  "Certainly. Might I suggest we review your open positions before the session closes?",
  "Of course. Rest assured, I am keeping a watchful eye on volatility this morning.",
  "Understood. I shall have a full briefing prepared for you shortly.",
  "With pleasure. Shall I also set an alert, should the price reach your target?",
];

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// 'publishable' only accepts requests carrying the project's publishable key,
// i.e. calls coming from our own app.
export default {
  fetch: withSupabase({ auth: "publishable" }, async (req) => {
    let message: unknown;
    try {
      ({ message } = await req.json());
    } catch {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (typeof message !== "string" || message.trim() === "") {
      return Response.json({ error: "A non-empty 'message' is required." }, { status: 400 });
    }

    await wait(FAKE_DELAY_MS);
    const reply = FAKE_REPLIES[Math.floor(Math.random() * FAKE_REPLIES.length)];

    return Response.json({ reply });
  }),
};

/* To call it once deployed:

  curl -i --request POST 'https://<project-ref>.supabase.co/functions/v1/assistant' \
    --header 'apikey: sb_publishable_...' \
    --header 'Content-Type: application/json' \
    --data '{"message":"Hello"}'

*/
