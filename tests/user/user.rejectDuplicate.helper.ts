// ===================== USER DUPLICATE (AXIOS SUPPORT) =====================

import mongoose, { Schema, model, InferSchemaType } from "mongoose";
import axios from "axios";

/**
 * User Duplicate-Rejection Test Helper
 *
 * Registers a Jest suite that validates the schema integrity rule for `email`
 * marked as `unique: true`.
 *
 * Each test case can run in two modes (controlled via `case.local`):
 * - `local: true`  -> seed via Mongoose, then expect a second create to fail.
 * - `local: false` -> seed via API (axios POST), then expect a second create to fail via API.
 *
 * Execution control:
 * - Set `RUN_USER === "true"` to enable these tests.
 * - Otherwise, the suite is skipped via `describe.skip`.
 */

jest.setTimeout(10000);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

type User = InferSchemaType<typeof userSchema>;
const UserModel = mongoose.models.User || model<User>("User", userSchema);

/**
 * User duplicate-rejection test case definition.
 * @property email Email to seed, then attempt to insert again.
 * @property password Password to seed with.
 * @property label Optional test label shown in Jest output.
 * @property local Select execution mode for this case (`true` = Mongoose, `false` = API via axios).
 * @property API_BASE_URL Optional base URL for API mode.
 * @property USER_API_ENDPOINT Optional user endpoint (defaults to `users`).
 * @property contentType Optional request Content-Type header (defaults to `application/json`).
 */
type UserTestCase = {
  email: string;
  password: string;
  label?: string;
  local: boolean;
  API_BASE_URL?: string;
  USER_API_ENDPOINT?: string;
  contentType?: string;
};

/**
 * Registers “reject duplicate email” tests.
 *
 * @param cases - Array of duplicate-rejection cases to run.
 * @returns void
 */
const rejectUserDuplicateTest = (cases: UserTestCase[]) => {
  const run = process.env.RUN_USER === "true";

  (run ? describe : describe.skip)("User Reject Duplicate Test", () => {
    afterEach(async () => {
      await UserModel.deleteMany({});
    });

    cases.forEach(
      (
        {
          email,
          password,
          label,
          local,
          API_BASE_URL,
          USER_API_ENDPOINT,
          contentType = "application/json",
        },
        index,
      ) => {
        test(label || `reject duplicate [${index}]`, async () => {
          let user;

          const base = process.env.API_BASE_URL || API_BASE_URL;
          const endpoint = USER_API_ENDPOINT || "users";

          if (local) {
            user = await UserModel.create({ email, password });
          } else {
            user = await axios.post(
              `${base}/${endpoint}`,
              { email, password },
              { headers: { "Content-Type": contentType } },
            );
          }

          await expect(
            local
              ? UserModel.create({ email, password })
              : axios.post(
                  `${base}/${endpoint}`,
                  { email, password },
                  { headers: { "Content-Type": contentType } },
                ),
          ).rejects.toThrow();
        });
      },
    );
  });
};

export default rejectUserDuplicateTest;
