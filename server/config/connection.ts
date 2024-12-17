import { Pool, QueryResult } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database configuration interface
interface DatabaseConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
}

class Database {
  private pool: Pool;

  constructor() {
    // Validate required environment variables
    this.validateEnvironmentVariables();

    // Configure database connection
    const config: DatabaseConfig = {
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "travel_db",
      password: process.env.DB_PASSWORD || "",
      port: parseInt(process.env.DB_PORT || "5432", 10),
    };

    // Create connection pool
    this.pool = new Pool(config);

    // Handle connection errors
    this.pool.on("error", (err) => {
      console.error("Unexpected PostgreSQL error", err);
      process.exit(-1);
    });
  }

  // Validate required database environment variables
  private validateEnvironmentVariables() {
    const requiredVars = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD"];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }
  }

  // Execute a query with optional parameters
  async query(text: string, params?: any[]): Promise<QueryResult> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log("Executed query", { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error("Query execution error", {
        query: text,
        params,
        error,
      });
      throw error;
    }
  }

  // Create destinations table if not exists
  async initializeDestinationsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        country VARCHAR(100) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await this.query(createTableQuery);
      console.log("Destinations table initialized successfully");
    } catch (error) {
      console.error("Failed to initialize destinations table", error);
      throw error;
    }
  }

  // Seed initial destinations (optional)
  async seedInitialDestinations() {
    const destinations = [
      {
        name: "Paris",
        country: "France",
        latitude: 48.8566,
        longitude: 2.3522,
        description:
          "The City of Light, famous for its art, culture, and iconic Eiffel Tower",
      },
      {
        name: "Tokyo",
        country: "Japan",
        latitude: 35.6762,
        longitude: 139.6503,
        description:
          "A bustling metropolis blending ultra-modern technology with traditional culture",
      },
    ];

    const insertQuery = `
      INSERT INTO destinations 
      (name, country, latitude, longitude, description) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (name) DO NOTHING
    `;

    for (const dest of destinations) {
      try {
        await this.query(insertQuery, [
          dest.name,
          dest.country,
          dest.latitude,
          dest.longitude,
          dest.description,
        ]);
      } catch (error) {
        console.error(`Failed to seed destination: ${dest.name}`, error);
      }
    }
  }

  // Close database connection
  async close() {
    await this.pool.end();
    console.log("Database connection closed");
  }
}

// Create and export a singleton database instance
const db = new Database();

// Optional: Initialize table and seed data on import
db.initializeDestinationsTable()
  .then(() => db.seedInitialDestinations())
  .catch(console.error);

export default db;
