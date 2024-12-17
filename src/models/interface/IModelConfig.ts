export interface IModelConfig {
  provider: "openai" | "groq" | "google";
  apiKey: string;
  model: string;
  fallbackPriority: number;
}
