import mongoose from "mongoose";

/**
 * Database CRUD & Integrity Test Suite (DCITS) - Modular Template
 *
 * This suite composes smaller Jest “test kits”:
 * - `tests/db/db.connect.helper.ts` (DB connection checks)
 * - `tests/user/*.helper.ts` (user create/update/delete + unique email integrity)
 *
 * Behavior control:
 * - `RUN_DB === "true"` enables the DB connection suite.
 * - `RUN_USER === "true"` enables the user CRUD/integrity suites.
 */
import registerDBConnectionTests from "./db/db.connect.helper";
import deleteUserTest from "./user/user.delete.helper";
import updateUserTest from "./user/user.update.helper";
import rejectUserDuplicateTest from "./user/user.rejectDuplicate.helper";
import registerUserCreateTest from "./user/user.create.helper";

/**
 * Suite entry point: defines which test cases to run for each modular kit.
 *
 * Tip: add more objects to the arrays passed into each helper to expand coverage.
 */

jest.setTimeout(10000);

describe("User DB Operations (Modular)", () => {
  /**
   * Registers the DB connection suite (controlled inside helper via `RUN_DB`).
   */
  registerDBConnectionTests();

  /**
   * Registers user CREATE test cases (controlled inside helper via `RUN_USER`).
   *
   * @param cases - Array of objects: `{ email, password, label? }`
   */
  registerUserCreateTest([
    {
      email: "test@example.com",
      password: "123456",
      label: "creates a user successfully",
    },
  ]);

  /**
   * Registers user INTEGRITY (duplicate email) test cases.
   *
   * @param cases - Array of objects: `{ email, password, label? }`
   */
  rejectUserDuplicateTest([
    {
      email: "test@example.com",
      password: "123456",
      label: "rejects duplicate email",
    },
  ]);

  /**
   * Registers user UPDATE test cases.
   *
   * @param cases - Array of objects:
   * `{ oldEmail, newEmail, password, label? }`
   */
  updateUserTest([
    {
      oldEmail: "old@example.com",
      newEmail: "new@example.com",
      password: "123456",
      label: "updates user email",
    },
  ]);

  /**
   * Registers user DELETE test cases.
   *
   * @param cases - Array of objects: `{ email, password, label? }`
   */
  deleteUserTest([
    {
      email: "delete@example.com",
      password: "123456",
      label: "deletes user",
    },
  ]);

  /**
   * Safety cleanup: close mongoose connection after all modular suites.
   * The connection state may depend on which sub-suites were enabled.
   */
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
});
