import express, { Request, Response, Router } from "express";
import { TravelRecommendationService } from "../services/TravelRecommendationService";
import { WeatherService } from "../services/WeatherService";
import { ErrorHandler } from "../utils/ErrorHandler";
import { ITravelRequest } from "../models/interface/ITravelRequest";

const router: Router = express.Router();
const travelService = new TravelRecommendationService();
const weatherService = new WeatherService();

router.post("/recommendations", async (req: Request, res: Response) => {
  try {
    const { interests, budget } = req.body;

    if (!interests || !Array.isArray(interests) || !budget) {
      return res.status(400).json({
        error:
          "Invalid request parameters. Interests array and budget are required.",
      });
    }

    const recommendations = await travelService.getRecommendations(
      interests,
      budget
    );

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    ErrorHandler.handle(error, "Travel Recommendations Endpoint");
    res.status(500).json({
      error: "Failed to get travel recommendations",
    });
  }
});

router.get("/attractions/:id", async (req: Request, res: Response) => {
  try {
    const attractionId = parseInt(req.params.id);
    const attractionInfo = await travelService.getDetailedAttractionInfo(
      attractionId
    );

    if (!attractionInfo) {
      return res.status(404).json({
        error: "Attraction not found",
      });
    }

    res.json({
      success: true,
      data: attractionInfo,
    });
  } catch (error) {
    ErrorHandler.handle(error, "Attraction Details Endpoint");
    res.status(500).json({
      error: "Failed to get attraction details",
    });
  }
});

router.get("/weather/:destination", async (req: Request, res: Response) => {
  try {
    const { destination } = req.params;
    const dateStr = req.query.date as string;
    const date = dateStr ? new Date(dateStr) : new Date();

    if (!destination) {
      return res.status(400).json({
        error: "Destination is required",
      });
    }

    const forecast = await weatherService.getForecast(destination, date);

    res.json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    ErrorHandler.handle(error, "Weather Forecast Endpoint");
    res.status(500).json({
      error: "Failed to get weather forecast",
    });
  }
});

router.post("/generate-itinerary", async (req: Request, res: Response) => {
  try {
    const travelRequest: ITravelRequest = req.body;

    if (
      !travelRequest.destination ||
      !travelRequest.duration ||
      !travelRequest.interests
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: destination, duration, and interests are required",
      });
    }
    const recommendations = await travelService.getRecommendations(
      travelRequest.interests,
      travelRequest.budget || "moderate"
    );

    const startDate = new Date(new Date());
    const weather = await weatherService.getForecast(
      travelRequest.destination,
      startDate
    );

    res.json({
      success: true,
      data: {
        recommendations,
        weather,
        destination: travelRequest.destination,
        duration: travelRequest.duration,
        interests: travelRequest.interests,
      },
    });
  } catch (error) {
    ErrorHandler.handle(error, "Itinerary Generation Endpoint");
    res.status(500).json({
      error: "Failed to generate itinerary",
    });
  }
});

export default router;
