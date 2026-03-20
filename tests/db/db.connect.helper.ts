// ===================== DB CONNECT (DYNAMIC URI) =====================

import mongoose from "mongoose";

/**
 * DB Connection Test Helper
 *
 * Registers a Jest suite that attempts to connect to MongoDB and verifies the
 * connection is established.
 *
 * Execution control:
 * - Set `RUN_DB === "true"` to enable these tests.
 * - Otherwise, the suite is skipped via `describe.skip`.
 */

jest.setTimeout(10000);

/**
 * Optional configuration for DB connection.
 * @property uri Optional MongoDB URI override (highest priority).
 * @property fallbackLocalUri Optional fallback URI (used if `uri`/`process.env.DB_URI` are not set).
 */
type DBConfig = {
  uri?: string; // user provided (prod or local)
  fallbackLocalUri?: string; // default local
};

/**
 * Registers the “Database Connection” test suite.
 *
 * @param config Optional DB config (uri/fallback override).
 * @returns void
 */
const registerDBConnectionTests = (config?: DBConfig) => {
  const run = process.env.RUN_DB === "true";

  (run ? describe : describe.skip)("Database Connection", () => {
    let dbConnectRes: Awaited<ReturnType<typeof mongoose.connect>> | null =
      null;

    beforeAll(async () => {
      try {
        const uri =
          config?.uri ||
          process.env.DB_URI ||
          config?.fallbackLocalUri ||
          "mongodb://127.0.0.1:27017/test_db";

        dbConnectRes = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 2000,
        });

        console.table([
          {
            label: "DB_CONNECTION",
            expected: "Connected",
            actual: "Connected",
            uri,
            host: dbConnectRes.connection.host,
            port: dbConnectRes.connection.port,
          },
        ]);
      } catch (error) {
        console.table([
          {
            label: "DB_CONNECTION",
            expected: "Connected",
            actual: "FAILED",
            error: (error as Error).message,
          },
        ]);

        throw error;
      }
    });

    test("DB should be connected", () => {
      expect(mongoose.connection.readyState).toBe(1);
    });
  });
};

export default registerDBConnectionTests;
