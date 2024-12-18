export interface IActivity {
  time: string;
  activity: string;
  location: string;
  estimatedCost: number;
  travelTips?: string;
}

export interface IWeatherForecast {
  temperature: number;
  conditions: string;
  precipitation?: number;
}

export interface IItineraryDay {
  day: number;
  activities: IActivity[];
  weatherForecast?: IWeatherForecast;
}
