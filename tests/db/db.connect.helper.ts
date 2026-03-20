import mongoose from "mongoose";

jest.setTimeout(10000);

/**
 * DB Connection Test Helper
 *
 * Registers a Jest suite that attempts to connect to MongoDB and asserts the
 * connection is established.
 *
 * Execution control:
 * - Set `RUN_DB === "true"` to enable these tests.
 * - Otherwise, the suite is skipped.
 *
 * Configuration note:
 * - The connection URI is currently hard-coded for the template.
 *   Swap it with your environment variable/URI strategy when integrating.
 */

const registerDBConnectionTests = () => {
  const run = process.env.RUN_DB === "true";

  (run ? describe : describe.skip)("Database Connection", () => {
    let dbConnectRes: Awaited<ReturnType<typeof mongoose.connect>> | null =
      null;

    beforeAll(async () => {
      try {
        dbConnectRes = await mongoose.connect(
          "mongodb://127.0.0.1:27017/test_db",
          {
            serverSelectionTimeoutMS: 2000,
          },
        );

        console.table([
          {
            label: "DB_CONNECTION",
            expected: "Connected",
            actual: "Connected",
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
