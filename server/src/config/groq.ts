import Groq from "groq-sdk";
import { env } from "@/config/env";

let client: Groq | null = null;

export const getGroqClient = (): Groq => {
  if (!env.groqApiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  if (!client) {
    client = new Groq({ apiKey: env.groqApiKey });
  }
  return client;
};
