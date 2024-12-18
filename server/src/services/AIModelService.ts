import OpenAI from "openai";
import GroqCloud from "groq-sdk";
import { ErrorHandler } from "../utils/ErrorHandler";
import { ConfigLoader } from "../utils/ConfigLoader";
import { IModelConfig } from "../models/interface/IModelConfig";

export interface GenerationOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

const DEFAULT_MODELS = {
  openai: "gpt-3.5-turbo",
  groq: "llama2-70b-4096",
  google: "gemini-pro",
} as const;

export class AIModelService {
  private clients: {
    openai?: OpenAI;
    groq?: GroqCloud;
  } = {};

  private modelConfigs: IModelConfig[];

  constructor() {
    const config = ConfigLoader.loadConfig();
    // Ensure all required properties are present and add default model if missing
    this.modelConfigs = config.aiModels.map((config) => ({
      ...config,
      // model: config.model || DEFAULT_MODELS[config.provider]
    })) as IModelConfig[];
    this.initializeClients();
  }

  private initializeClients(): void {
    this.modelConfigs.forEach((modelConfig) => {
      switch (modelConfig.provider) {
        case "openai":
          this.clients.openai = new OpenAI({
            apiKey: modelConfig.apiKey,
          });
          break;
        case "groq":
          this.clients.groq = new GroqCloud({
            apiKey: modelConfig.apiKey,
          });
          break;
        default:
          ErrorHandler.log(`Unsupported provider: ${modelConfig.provider}`);
      }
    });
  }

  async generateText(options: GenerationOptions): Promise<string> {
    if (this.modelConfigs.length === 0) {
      throw new Error("No AI model configurations available");
    }

    const sortedModels = [...this.modelConfigs].sort(
      (a, b) => a.fallbackPriority - b.fallbackPriority
    );

    for (const modelConfig of sortedModels) {
      try {
        return await this.generateTextWithModel(modelConfig, options);
      } catch (error) {
        ErrorHandler.log(
          `Model with priority ${modelConfig.fallbackPriority} failed`,
          error
        );
        continue;
      }
    }

    throw new Error("Failed to generate text with any available model");
  }

  private async generateTextWithModel(
    modelConfig: IModelConfig,
    options: GenerationOptions
  ): Promise<string> {
    switch (modelConfig.provider) {
      case "openai":
        return this.generateOpenAIText(modelConfig, options);
      case "groq":
        return this.generateGroqText(modelConfig, options);
      default:
        throw new Error(`Unsupported AI provider: ${modelConfig.provider}`);
    }
  }

  private async generateOpenAIText(
    modelConfig: IModelConfig,
    options: GenerationOptions
  ): Promise<string> {
    if (!this.clients.openai) {
      throw new Error("OpenAI client not initialized");
    }

    const response = await this.clients.openai.chat.completions.create({
      model: modelConfig.model || DEFAULT_MODELS.openai,
      messages: [{ role: "user", content: options.prompt }],
      max_tokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7,
    });

    return response.choices[0].message.content || "";
  }

  private async generateGroqText(
    modelConfig: IModelConfig,
    options: GenerationOptions
  ): Promise<string> {
    if (!this.clients.groq) {
      throw new Error("Groq client not initialized");
    }

    const response = await this.clients.groq.chat.completions.create({
      model: modelConfig.model || DEFAULT_MODELS.groq,
      messages: [{ role: "user", content: options.prompt }],
      max_tokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7,
    });

    return response.choices[0].message.content || "";
  }

  async generateStructuredResponse<T>(
    options: GenerationOptions & {
      responseType: new () => T;
    }
  ): Promise<T> {
    try {
      const rawResponse = await this.generateText({
        ...options,
        prompt: `${options.prompt}\n\nRespond ONLY with a valid JSON that matches the structure of the expected response type.`,
      });

      const trimmedResponse = rawResponse
        .trim()
        .replace(/^```json\n?|```$/g, "");
      const parsedResponse = JSON.parse(trimmedResponse);

      return parsedResponse as T;
    } catch (error) {
      ErrorHandler.handle(error, "Structured AI Response Generation");
      throw error;
    }
  }
}

export default AIModelService;
