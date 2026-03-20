import mongoose from "mongoose";

/**
 * Database CRUD & Integrity Test Suite (DCITS) - Modular Template
 *
 * Updated:
 * - Supports BOTH local DB + API-based testing
 * - Dynamic DB URI handling
 * - Per-test control via `local` flag
 *
 * Env Control:
 * - RUN_DB=true → runs DB connection tests
 * - RUN_USER=true → runs user tests
 * - API_BASE_URL → used for API mode (optional)
 * - DB_URI → custom DB connection (optional)
 */

import registerDBConnectionTests from "./db/db.connect.helper";
import deleteUserTest from "./user/user.delete.helper";
import updateUserTest from "./user/user.update.helper";
import rejectUserDuplicateTest from "./user/user.rejectDuplicate.helper";
import registerUserCreateTest from "./user/user.create.helper";

jest.setTimeout(10000);

describe("User DB Operations (Modular)", () => {
  /**
   * DB CONNECTION
   * Uses:
   * - config.uri
   * - OR process.env.DB_URI
   * - OR fallback local
   */
  registerDBConnectionTests({
    uri: process.env.DB_URI, // optional (prod or custom)
  });

  /**
   * USER CREATE
   * local = true  → Mongoose
   * local = false → API
   */
  registerUserCreateTest([
    {
      email: "test@example.com",
      password: "123456",
      label: "creates user locally",
      local: true,
    },
    {
      email: "api@test.com",
      password: "123456",
      label: "creates user via API",
      local: true,
      // API_BASE_URL: process.env.API_BASE_URL,
      // USER_API_ENDPOINT: "users",
    },
  ]);

  /**
   * DUPLICATE CHECK
   */
  rejectUserDuplicateTest([
    {
      email: "test@example.com",
      password: "123456",
      label: "reject duplicate locally",
      local: true,
    },
  ]);

  /**
   * UPDATE TESTS
   */
  updateUserTest([
    {
      oldEmail: "old@example.com",
      newEmail: "new@example.com",
      password: "123456",
      label: "update locally",
      local: true,
    },
  ]);

  /**
   * DELETE TESTS
   */
  deleteUserTest([
    {
      email: "delete@example.com",
      password: "123456",
      label: "delete locally",
      local: true,
    },
  ]);

  /**
   * GLOBAL CLEANUP
   */
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
});
