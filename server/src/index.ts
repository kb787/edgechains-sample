import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import travelRoutes from "./routes/route";
import { ConfigLoader } from "./utils/ConfigLoader";
import { ErrorHandler } from "./utils/ErrorHandler";

dotenv.config();

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || "3500", 10);
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    this.app.use("/v1/api", travelRoutes);
  }

  public async start(): Promise<void> {
    try {
      const config = ConfigLoader.loadConfig();

      this.app.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
      });
    } catch (error) {
      ErrorHandler.handle(error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start().catch(console.error);
