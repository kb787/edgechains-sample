const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigrations() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Run migration files
    const migrationDir = path.join(__dirname, "src", "database", "migrations");
    const migrationFiles = fs
      .readdirSync(migrationDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, "utf8");

      try {
        await client.query(migrationSQL);
        console.log(`Applied migration: ${file}`);
      } catch (migrationError) {
        console.error(`Error applying migration ${file}:`, migrationError);
      }
    }

    // Optional: Run seed data
    const seedPath = path.join(
      __dirname,
      "src",
      "database",
      "seeds",
      "initial_data.sql"
    );
    const seedSQL = fs.readFileSync(seedPath, "utf8");
    await client.query(seedSQL);
    console.log("Seed data inserted");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

runMigrations();
