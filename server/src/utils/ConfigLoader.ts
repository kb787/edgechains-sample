import path from "path";
import dotenv from "dotenv";
import { AppConfig } from "./AppConfig";

export class ConfigLoader {
  static loadConfig(
    env: string = process.env.NODE_ENV || "development"
  ): AppConfig {
    dotenv.config();

    try {
      const config: AppConfig = {
        aiModels: this.getAIModels(),
        database: this.getDatabaseConfig(),
        services: {
          weather: this.getWeatherConfig(),
        },
      };

      this.validateConfig(config);
      return config;
    } catch (error) {
      console.error("Error loading configuration:", error);
      throw new Error("Failed to load application configuration");
    }
  }

  private static getAIModels() {
    return [
      {
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY || "",
        model: "gpt-3.5-turbo",
        fallbackPriority: parseInt(
          process.env.OPENAI_FALLBACK_PRIORITY || "1",
          10
        ),
      },
      {
        provider: "groq",
        apiKey: process.env.GROQ_API_KEY || "",
        model: "llama2-70b-4096",
        fallbackPriority: parseInt(
          process.env.GROQ_FALLBACK_PRIORITY || "2",
          10
        ),
      },
    ].filter((model) => model.apiKey);
  }

  private static getDatabaseConfig() {
    return {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      username: process.env.DB_USER || "",
      password: String(process.env.DB_PASSWORD || ""),
      database: process.env.DB_NAME || "",
    };
  }

  private static getWeatherConfig() {
    return {
      apiKey: process.env.WEATHER_API_KEY || "",
      baseUrl:
        process.env.WEATHER_API_BASE_URL ||
        "https://api.openweathermap.org/data/2.5/forecast",
    };
  }

  private static validateConfig(config: AppConfig): boolean {
    const requiredFields = {
      "AI Models": config.aiModels?.length > 0,
      "Database Host": !!config.database.host,
      "Database Name": !!config.database.database,
      "Weather API Key": !!config.services.weather.apiKey,
      "Weather Base URL": !!config.services.weather.baseUrl,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new Error(`Missing configuration: ${missingFields.join(", ")}`);
    }

    return true;
  }
}
