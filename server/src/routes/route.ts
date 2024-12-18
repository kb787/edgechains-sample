import express, { Request, Response, Router } from "express";
import AIModelService from "../services/AIModelService";
import { TravelRecommendationService } from "../services/TravelRecommendationService";
import { WeatherService } from "../services/WeatherService";
import { ErrorHandler } from "../utils/ErrorHandler";

export class TravelRoutes {
  private router: Router;
  private aiModelService: AIModelService;
  private travelRecommendationService: TravelRecommendationService;
  private weatherService: WeatherService;

  constructor() {
    this.router = express.Router();
    this.aiModelService = new AIModelService();
    this.travelRecommendationService = new TravelRecommendationService();
    this.weatherService = new WeatherService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/ai/generate", this.handleTextGeneration.bind(this));
    this.router.post(
      "/ai/structured-response",
      this.handleStructuredResponse.bind(this)
    );
    this.router.get(
      "/recommendations",
      this.handleTravelRecommendations.bind(this)
    );
    this.router.get("/attraction/:id", this.handleAttractionDetails.bind(this));
    this.router.get("/weather", this.handleWeatherForecast.bind(this));
  }

  private async handleTextGeneration(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { prompt, maxTokens, temperature } = req.body;

      if (!prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
      }

      const generatedText = await this.aiModelService.generateText({
        prompt,
        maxTokens: maxTokens || 500,
        temperature: temperature || 0.7,
      });

      res.json({ text: generatedText });
    } catch (error) {
      ErrorHandler.handle(error, "AI Text Generation");
      res.status(500).json({ error: "Failed to generate text" });
    }
  }

  private async handleStructuredResponse(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { prompt, responseType, maxTokens, temperature } = req.body;

      if (!prompt || !responseType) {
        res.status(400).json({ error: "Prompt and responseType are required" });
        return;
      }

      const structuredResponse =
        await this.aiModelService.generateStructuredResponse({
          prompt,
          responseType,
          maxTokens: maxTokens || 500,
          temperature: temperature || 0.7,
        });

      res.json(structuredResponse);
    } catch (error) {
      ErrorHandler.handle(error, "Structured AI Response");
      res.status(500).json({ error: "Failed to generate structured response" });
    }
  }

  private async handleTravelRecommendations(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { interests, budget } = req.query;

      if (!interests || !budget) {
        res.status(400).json({ error: "Interests and budget are required" });
        return;
      }

      const interestsArray = (interests as string).split(",");
      const budgetString = budget as string;

      const recommendations =
        await this.travelRecommendationService.getRecommendations(
          interestsArray,
          budgetString
        );

      res.json(recommendations);
    } catch (error) {
      ErrorHandler.handle(error, "Travel Recommendations");
      res
        .status(500)
        .json({ error: "Failed to generate travel recommendations" });
    }
  }

  private async handleAttractionDetails(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const attractionId = parseInt(req.params.id, 10);

      if (isNaN(attractionId)) {
        res.status(400).json({ error: "Invalid attraction ID" });
        return;
      }

      const attractionDetails =
        await this.travelRecommendationService.getDetailedAttractionInfo(
          attractionId
        );

      if (!attractionDetails) {
        res.status(404).json({ error: "Attraction not found" });
        return;
      }

      res.json(attractionDetails);
    } catch (error) {
      ErrorHandler.handle(error, "Attraction Details");
      res.status(500).json({ error: "Failed to retrieve attraction details" });
    }
  }

  private async handleWeatherForecast(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { destination, date } = req.query;

      if (!destination || !date) {
        res.status(400).json({ error: "Destination and date are required" });
        return;
      }

      const forecastDate = new Date(date as string);

      if (isNaN(forecastDate.getTime())) {
        res.status(400).json({ error: "Invalid date format" });
        return;
      }

      const weatherForecast = await this.weatherService.getForecast(
        destination as string,
        forecastDate
      );

      res.json(weatherForecast);
    } catch (error) {
      ErrorHandler.handle(error, "Weather Forecast");
      res.status(500).json({ error: "Failed to retrieve weather forecast" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default new TravelRoutes().getRouter();
