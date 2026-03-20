import mongoose from "mongoose";

/**
 * Database CRUD & Integrity Test Suite (DCITS) - Modular Template
 *
 * Purpose:
 * - Compose a DB connection check and user CRUD/integrity tests from modular helpers.
 *
 * Runtime controls:
 * - `RUN_DB === "true"` enables DB connection tests.
 * - `RUN_USER === "true"` enables user CRUD/integrity tests.
 *
 * Mode switching (per test case):
 * - User helpers accept arrays of objects with `local: boolean`.
 * - `local: true`  -> run operations directly with Mongoose.
 * - `local: false` -> run operations through the API using `axios`.
 *
 * API mode expectations:
 * - Provide `API_BASE_URL` and (optionally) `USER_API_ENDPOINT` so axios calls hit your service.
 * - Assertions still verify state using the shared Mongoose model, so API writes should affect the same DB.
 */

import registerDBConnectionTests from "./db/db.connect.helper";
import deleteUserTest from "./user/user.delete.helper";
import updateUserTest from "./user/user.update.helper";
import rejectUserDuplicateTest from "./user/user.rejectDuplicate.helper";
import registerUserCreateTest from "./user/user.create.helper";

jest.setTimeout(10000);

describe("User DB Operations (Modular)", () => {
  /**
   * Registers the DB connection suite.
   *
   * @param config.uri - Optional MongoDB URI override.
   * If omitted, the helper falls back to `process.env.DB_URI` (and then a local default).
   */
  registerDBConnectionTests({
    uri: process.env.DB_URI, // optional (prod or custom)
  });

  /**
   * USER CREATE
   * Each case controls execution mode via `local`.
   *
   * @param cases - Array of:
   * `{ email, password, label?, local, API_BASE_URL?, USER_API_ENDPOINT?, contentType? }`
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
   * DUPLICATE CHECK (unique email integrity)
   *
   * @param cases - Array of:
   * `{ email, password, label?, local, API_BASE_URL?, USER_API_ENDPOINT?, contentType? }`
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
   *
   * @param cases - Array of:
   * `{ oldEmail, newEmail, password, label?, local, API_BASE_URL?, USER_API_ENDPOINT?, contentType? }`
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
   *
   * @param cases - Array of:
   * `{ email, password, label?, local, API_BASE_URL?, USER_API_ENDPOINT?, contentType? }`
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
