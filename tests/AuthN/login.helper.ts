// ===================== USER LOGIN (AXIOS SUPPORT) =====================

import mongoose, { Schema, model, InferSchemaType } from "mongoose";
import axios from "axios";

/**
 * User Login Test Helper
 *
 * Registers a Jest suite that validates user authentication.
 * Each test case can run in two modes:
 * - `local: true`  -> simulate login via DB lookup.
 * - `local: false` -> perform login via API using axios.
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
 * User login test case definition.
 * @property email Email used for login.
 * @property password Password used for login.
 * @property label Optional test label shown in Jest output.
 * @property local Select execution mode (`true` = DB check, `false` = API).
 * @property API_BASE_URL Optional base URL for API mode.
 * @property LOGIN_ENDPOINT Optional login endpoint (default: `login`).
 * @property contentType Optional request Content-Type header.
 */
type LoginTestCase = {
  email: string;
  password: string;
  label?: string;
  local: boolean;
  API_BASE_URL?: string;
  LOGIN_ENDPOINT?: string;
  contentType?: string;
};

/**
 * Registers user login tests (seeds a user, then asserts login via DB or API).
 *
 * @param cases - One or more login scenarios (`LoginTestCase`).
 * @returns void
 */
const loginTest = (cases: LoginTestCase[]) => {
  const run = process.env.RUN_USER === "true";

  (run ? describe : describe.skip)("User Login Tests", () => {
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
          LOGIN_ENDPOINT,
          contentType = "application/json",
        },
        index,
      ) => {
        test(label || `login user [${index}]`, async () => {
          const base = process.env.API_BASE_URL || API_BASE_URL;
          const endpoint = LOGIN_ENDPOINT || "login";

          // Seed user (required for login)
          await UserModel.create({ email, password });

          if (local) {
            // Simulate login check (DB-based)
            const user = await UserModel.findOne({ email });

            expect(user).not.toBeNull();
            expect(user!.password).toBe(password);
          } else {
            // API login
            const res = await axios.post(
              `${base}/${endpoint}`,
              { email, password },
              {
                headers: {
                  "Content-Type": contentType,
                },
              },
            );

            expect(res.status).toBe(200);

            // Optional: check token existence
            expect(res.data).toBeDefined();
          }
        });
      },
    );
  });
};

export default loginTest;
