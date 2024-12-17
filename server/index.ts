import express from "express";
import dotenv from "dotenv";
import travelRoutes from "./routes/route";
import { ConfigLoader } from "./utils/ConfigLoader";
import { ErrorHandler } from "./utils/ErrorHandler";

dotenv.config();

const app = express();
const PORT = 3500;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/v1/api", travelRoutes);

async function main() {
  try {
    const config = ConfigLoader.loadConfig();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    ErrorHandler.handle(error);
  }
}

// Run the application
main().catch(console.error);
