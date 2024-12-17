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

export class AIModelService {
  private clients: {
    openai?: OpenAI;
    groq?: GroqCloud;
  } = {};

  private modelConfigs: IModelConfig[];

  constructor() {
    const config = ConfigLoader.loadConfig();
    this.modelConfigs = config.aiModels;
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

    const sortedModels = this.modelConfigs.sort(
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
        return this.generateOpenAIText(options);
      case "groq":
        return this.generateGroqText(options);
      default:
        throw new Error(`Unsupported AI provider: ${modelConfig.provider}`);
    }
  }

  private async generateOpenAIText(
    options: GenerationOptions
  ): Promise<string> {
    if (!this.clients.openai) {
      throw new Error("OpenAI client not initialized");
    }

    const response = await this.clients.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: options.prompt }],
      max_tokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7,
    });

    return response.choices[0].message.content || "";
  }

  private async generateGroqText(options: GenerationOptions): Promise<string> {
    if (!this.clients.groq) {
      throw new Error("Groq client not initialized");
    }

    const response = await this.clients.groq.chat.completions.create({
      model: "llama2-70b-4096",
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
