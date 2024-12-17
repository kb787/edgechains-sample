// src/utils/ErrorHandler.ts
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export class ErrorHandler {
  private static logDirectory = path.join(process.cwd(), "logs");

  // Log errors to console and file
  static async handle(error: unknown, context?: string): Promise<void> {
    const errorMessage = this.formatError(error);

    // Console logging
    console.error(`[ERROR] ${context || "Unhandled Error"}:`, errorMessage);

    // File logging
    await this.logToFile(errorMessage, context);
  }

  // Log method for non-critical information
  static log(message: string, details?: unknown): void {
    console.log(`[LOG] ${message}`, details);
  }

  // Format error to string
  private static formatError(error: unknown): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}\n${error.stack}`;
    }
    return String(error);
  }

  // Write error to log file
  private static async logToFile(
    errorMessage: string,
    context?: string
  ): Promise<void> {
    try {
      // Ensure logs directory exists
      await mkdir(this.logDirectory, { recursive: true });

      // Generate filename with current date
      const filename = `error-${new Date().toISOString().split("T")[0]}.log`;
      const logFilePath = path.join(this.logDirectory, filename);

      // Append error to log file
      const logEntry = `
[${new Date().toISOString()}] ${context || "Unhandled Error"}
${errorMessage}
-----------------------------------
`;

      await writeFile(logFilePath, logEntry, { flag: "a" });
    } catch (writeError) {
      console.error("Failed to write error log:", writeError);
    }
  }

  // Validate input data with improved type handling
  static validateInput<T extends Record<string, any>>(
    data: T,
    validationRules: {
      [K in keyof T]: (value: T[K]) => boolean;
    }
  ): boolean {
    for (const [key, validate] of Object.entries(validationRules) as Array<
      [keyof T, (value: any) => boolean]
    >) {
      const value = data[key];
      if (!validate(value)) {
        throw new Error(`Invalid input for ${String(key)}`);
      }
    }
    return true;
  }
}
