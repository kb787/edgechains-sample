import dotenv from "dotenv";
// import { TravelItineraryAgent } from './models/TravelItineraryAgent';
import { AIModelFactory } from "./models/AIModelFactory";
import { ITravelRequest } from "./models/interface/ITravelRequest";
import { ConfigLoader } from "./utils/ConfigLoader";
import { ErrorHandler } from "./utils/ErrorHandler";

dotenv.config();

async function main() {
  try {
    const config = ConfigLoader.loadConfig();
  } catch (error) {
    ErrorHandler.handle(error);
  }
}

// Run the application
main().catch(console.error);
