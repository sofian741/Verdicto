import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Official Google Gemini provider factory.
 *
 * Uses the official Vercel AI SDK Google provider (`@ai-sdk/google`) to talk
 * directly to the Gemini API using an API key from Google AI Studio.
 * No base URL, no Authorization headers, no OpenAI-compatible endpoint.
 *
 * Required env vars (see .env.example):
 *   AI_API_KEY - your Google AI Studio Gemini API key
 *   AI_MODEL   - the Gemini model id to use (defaults to gemini-2.5-flash)
 */
export function createAiProvider(apiKey: string) {
  return createGoogleGenerativeAI({
    apiKey,
  });
}

export function getAiModelId(): string {
  return process.env.AI_MODEL ?? "gemini-2.5-flash";
}
