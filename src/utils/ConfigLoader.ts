import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { AppConfig } from "./AppConfig";
export class ConfigLoader {
  private static configPath = path.join(process.cwd(), "config");

  static loadConfig(
    env: string = process.env.NODE_ENV || "development"
  ): AppConfig {
    dotenv.config();

    try {
      const defaultConfigPath = path.join(this.configPath, "default.json");
      const defaultConfig = JSON.parse(
        fs.readFileSync(defaultConfigPath, "utf8")
      );

      const envConfigPath = path.join(this.configPath, `${env}.json`);
      const envConfig = fs.existsSync(envConfigPath)
        ? JSON.parse(fs.readFileSync(envConfigPath, "utf8"))
        : {};
      const mergedConfig = this.mergeConfigs(defaultConfig, envConfig);
      this.validateConfig(mergedConfig);

      return mergedConfig;
    } catch (error) {
      console.error("Error loading configuration:", error);
      throw new Error("Failed to load application configuration");
    }
  }

  // Deep merge configuration objects
  private static mergeConfigs(defaultConfig: any, envConfig: any): AppConfig {
    const mergedConfig = { ...defaultConfig };
    const deepMerge = (target: any, source: any) => {
      for (const key in source) {
        if (source[key] instanceof Object) {
          target[key] = target[key] || {};
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    deepMerge(mergedConfig, envConfig);
    this.overrideWithEnvVars(mergedConfig);

    return mergedConfig;
  }

  private static overrideWithEnvVars(config: AppConfig): void {
    if (process.env.OPENAI_API_KEY) {
      config.aiModels = config.aiModels.map((model) =>
        model.provider === "openai"
          ? {
              ...model,
              apiKey: process.env.OPENAI_API_KEY!,
              fallbackPriority: model.fallbackPriority || 1,
            }
          : model
      );
    }
    config.database = {
      host: process.env.DB_HOST || config.database.host,
      port: parseInt(process.env.DB_PORT || "", 10) || config.database.port,
      username: process.env.DB_USER || config.database.username,
      password: process.env.DB_PASSWORD || config.database.password,
      database: process.env.DB_NAME || config.database.database,
    };
    if (process.env.WEATHER_API_KEY) {
      config.services.weather.apiKey = process.env.WEATHER_API_KEY;
    }
    config.services.weather.baseUrl =
      process.env.WEATHER_API_BASE_URL || config.services.weather.baseUrl;
  }
  static validateConfig(config: AppConfig): boolean {
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
