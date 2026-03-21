// ===================== USER UPDATE (AXIOS SUPPORT) =====================

import mongoose, { Schema, model, InferSchemaType } from "mongoose";
import axios from "axios";

/**
 * User Update Test Helper
 *
 * Registers a Jest suite that validates updating a user email.
 * Each test case can run in two modes:
 * - `local: true`  -> run via Mongoose (create + save)
 * - `local: false` -> run via API (axios POST + axios PUT) and then assert state via the same Mongoose model.
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
 * User update test case definition.
 * @property oldEmail Existing email used to seed the user.
 * @property newEmail New email to persist.
 * @property password Password used when creating the seed user.
 * @property label Optional test label shown in Jest output.
 * @property local Select execution mode for this case.
 *                  `true` = Mongoose flow, `false` = API flow (axios).
 * @property API_BASE_URL Optional base URL for API mode (defaults to `process.env.API_BASE_URL`).
 * @property USER_API_ENDPOINT Optional user endpoint (defaults to `users`).
 * @property contentType Optional request Content-Type header (defaults to `application/json`).
 */
type UserTestCase = {
  oldEmail: string;
  newEmail: string;
  password: string;
  label?: string;
  local: boolean;
  API_BASE_URL?: string;
  USER_API_ENDPOINT?: string;
  contentType?: string;
};

/**
 * Registers user update tests.
 *
 * @param cases - Array of update cases to run.
 * @returns void
 */
const updateUserTest = (cases: UserTestCase[]) => {
  const run = process.env.RUN_USER === "true";

  (run ? describe : describe.skip)("User Update Tests", () => {
    afterEach(async () => {
      await UserModel.deleteMany({});
    });

    cases.forEach(
      (
        {
          oldEmail,
          newEmail,
          password,
          label,
          local,
          API_BASE_URL,
          USER_API_ENDPOINT,
          contentType = "application/json",
        },
        index,
      ) => {
        test(label || `update user [${index}]`, async () => {
          let user;

          const base = process.env.API_BASE_URL || API_BASE_URL;
          const endpoint = USER_API_ENDPOINT || "users";

          if (local) {
            user = await UserModel.create({
              email: oldEmail,
              password,
            });

            user.email = newEmail;
            await user.save();
            expect(user.email).toBe(newEmail);
          } else {
            await axios.post(
              `${base}/${endpoint}`,
              { email: oldEmail, password },
              { headers: { "Content-Type": contentType } },
            );

            await axios.put(
              `${base}/${endpoint}`,
              { email: newEmail },
              { headers: { "Content-Type": contentType } },
            );
          }

          const updated = await UserModel.findOne({ email: newEmail });
          expect(updated).not.toBeNull();
        });
      },
    );
  });
};

export default updateUserTest;
