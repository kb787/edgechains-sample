import axios from "axios";
import { ErrorHandler } from "../utils/ErrorHandler";
import { ConfigLoader } from "../utils/ConfigLoader";

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
    average: number;
  };
  conditions: string;
  humidity: number;
  windSpeed: number;
}

export class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    const config = ConfigLoader.loadConfig();
    this.apiKey = config.services.weather.apiKey;
    this.baseUrl = config.services.weather.baseUrl;
  }

  async getForecast(destination: string, date: Date): Promise<WeatherForecast> {
    try {
      // Get coordinates for the destination
      const { latitude, longitude } = await this.getCoordinates(destination);

      // Fetch weather data
      const response = await axios.get(this.baseUrl, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.apiKey,
          units: "metric",
        },
      });

      return this.processWeatherData(response.data, date);
    } catch (error) {
      ErrorHandler.handle(error, `Weather forecast for ${destination}`);
      return this.getFallbackWeatherData(date);
    }
  }

  private async getCoordinates(
    destination: string
  ): Promise<{ latitude: number; longitude: number }> {
    // In a real-world scenario, this would use a geocoding service
    const coordinatesMap: Record<
      string,
      { latitude: number; longitude: number }
    > = {
      Tokyo: { latitude: 35.6762, longitude: 139.6503 },
      Kyoto: { latitude: 35.0116, longitude: 135.7681 },
      // Add more destinations as needed
    };

    const coordinates = coordinatesMap[destination];
    if (!coordinates) {
      throw new Error(`Coordinates not found for destination: ${destination}`);
    }

    return coordinates;
  }

  private processWeatherData(
    weatherData: any,
    targetDate: Date
  ): WeatherForecast {
    // Process OpenWeatherMap API response
    const forecastList = weatherData.list || [];

    // Find forecast for the specific date
    const dayForecast = forecastList.find((forecast: any) => {
      const forecastDate = new Date(forecast.dt * 1000);
      return forecastDate.toDateString() === targetDate.toDateString();
    });

    if (!dayForecast) {
      return this.getFallbackWeatherData(targetDate);
    }

    return {
      date: targetDate.toISOString().split("T")[0],
      temperature: {
        min: dayForecast.main.temp_min,
        max: dayForecast.main.temp_max,
        average: dayForecast.main.temp,
      },
      conditions: dayForecast.weather[0].description,
      humidity: dayForecast.main.humidity,
      windSpeed: dayForecast.wind.speed,
    };
  }

  private getFallbackWeatherData(date: Date): WeatherForecast {
    return {
      date: date.toISOString().split("T")[0],
      temperature: {
        min: 20,
        max: 25,
        average: 22,
      },
      conditions: "Moderate",
      humidity: 60,
      windSpeed: 5,
    };
  }
}
