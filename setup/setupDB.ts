// tests/setup/setupDB.ts

import mongoose from "mongoose";

export async function connectTestDB(
  serverSelectionTimeoutMS: number = 2000,
  dbConnectionString: string = "mongodb://127.0.0.1:27017",
  test_dbName: string = "test_db",
) {
  try {
    const res = await mongoose.connect(
      `${dbConnectionString || process.env.MONGODB_URI}/${test_dbName}`,
      {
        serverSelectionTimeoutMS,
      },
    );

    console.table([
      {
        label: "DB_CONNECTION",
        actual: "Connected",
        host: res.connection.host,
        port: res.connection.port,
      },
    ]);

    return res;
  } catch (error) {
    console.table([
      {
        label: "DB_CONNECTION",
        actual: "FAILED",
        error: (error as Error).message,
      },
    ]);

    throw error;
  }
}

export async function disconnectTestDB() {
  await mongoose.connection.close();
}
