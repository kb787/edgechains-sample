import dotenv from "dotenv";
// import getInstance from "./config/dbConnection";
// import { TravelItineraryAgent } from './models/TravelItineraryAgent';
// import { AIModelFactory } from './models/AIModelFactory';
// import { ITravelRequest } from './models/interfaces/ITravelRequest';
import { ConfigLoader } from "./utils/ConfigLoader";
import { ErrorHandler } from "./utils/ErrorHandler";

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Load configuration
    const config = ConfigLoader.loadConfig();

    //  Create AI Model Factory
    //  const modelFactory = new AIModelFactory(config.aiModels);

    //   Initialize Travel Itinerary Agent with multiple models
    //  const travelAgent = new TravelItineraryAgent(
    //    modelFactory.getPrimaryModel(),
    //    modelFactory.getBackupModel()
    //  );

    //   Example travel request
    //  const travelRequest: ITravelRequest = {
    //    destination: 'Tokyo, Japan',
    //    duration: 7,
    //    travelerType: 'Solo Tech Enthusiast',
    //    interests: ['technology', 'culture', 'food', 'photography'],
    //    budget: 'moderate',
    //    season: 'spring'
    //  };

    //   Generate itinerary
    //  const itinerary = await travelAgent.generateItinerary(travelRequest);

    //   Output results
    //  console.log('Generated Itinerary:', JSON.stringify(itinerary, null, 2));
  } catch (error) {
    ErrorHandler.handle(error);
  }
}

// Run the application
main().catch(console.error);
