import "dotenv/config";
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
import signupTest from "./AuthN/signup.helper";
import loginTest from "./AuthN/login.helper";
import logoutTest from "./AuthN/logout.helper";
/**
 * Database CRUD & Integrity Test Suite (DCITS) - Modular Template
 *
 * Order:
 * 1. DB Connection
 * 2. Auth (Signup → Login → Logout)
 * 3. CRUD Operations
 */

jest.setTimeout(10000);

describe("User DB Operations (Modular)", () => {
  /**
   * DB CONNECTION
   */
  registerDBConnectionTests({
    uri: process.env.DB_URI,
  });

  /**
   * ===================== AUTH FLOW =====================
   */

  /**
   * SIGNUP
   */
  signupTest([
    {
      email: "signup@test.com",
      password: "123456",
      passwordConfirm: "123456",
      username: "signupUser",
      label: "signup locally",
      local: true,
    },
  ]);

  /**
   * LOGIN
   */
  loginTest([
    {
      email: "login@test.com",
      password: "123456",
      label: "login locally",
      local: true,
    },
  ]);

  /**
   * LOGOUT
   */
  logoutTest([
    {
      label: "logout locally",
      local: true,
    },
  ]);

  /**
   * ===================== CRUD =====================
   */

  /**
   * CREATE
   */
  registerUserCreateTest([
    {
      email: "test@example.com",
      password: "123456",
      label: "creates user locally",
      local: true,
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
   * UPDATE
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
   * DELETE
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
