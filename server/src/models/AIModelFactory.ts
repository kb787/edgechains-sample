import OpenAI from "openai";
import GroqCloud from "groq-sdk";
import { ErrorHandler } from "../utils/ErrorHandler";
import { IModelConfig } from "../models/interface/IModelConfig";

export class AIModelFactory {
  static createClient(modelConfig: IModelConfig): OpenAI | GroqCloud {
    switch (modelConfig.provider) {
      case "openai":
        return new OpenAI({
          apiKey: modelConfig.apiKey,
        });
      case "groq":
        return new GroqCloud({
          apiKey: modelConfig.apiKey,
        });
      default:
        ErrorHandler.log(`Unsupported provider: ${modelConfig.provider}`);
        throw new Error(`Unsupported provider: ${modelConfig.provider}`);
    }
  }
}

export default AIModelFactory;
