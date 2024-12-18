export interface AppConfig {
  aiModels: Array<{
    provider: string;
    apiKey: string;
    fallbackPriority: number;
  }>;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  services: {
    weather: {
      apiKey: string;
      baseUrl: string;
    };
  };
}
