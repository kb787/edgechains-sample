import { IModelConfig } from "../models/interface/IModelConfig";
export interface IDatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface IWeatherServiceConfig {
  apiKey: string;
  baseUrl: string;
}

export interface IServicesConfig {
  weather: IWeatherServiceConfig;
}

export interface AppConfig {
  aiModels: IModelConfig[];
  database: IDatabaseConfig;
  services: IServicesConfig;
}
