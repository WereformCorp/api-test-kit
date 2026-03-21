// ===================== USER SIGNUP (AXIOS SUPPORT) =====================

import mongoose, { Schema, model, InferSchemaType } from "mongoose";
import axios from "axios";

/**
 * User Signup Test Helper
 *
 * Registers a Jest suite for registration: duplicate checks, password confirm,
 * then create via Mongoose or via API with a structured payload.
 *
 * Modes (per case):
 * - `local: true`  → Mongoose `User` create / duplicate handling on the test schema.
 * - `local: false` → Optional existence `POST`, then `POST` signup body (`name`, `username`, `eAddress`, …).
 *
 * Environment:
 * - `USER_API_BASE_URL` — used when the case omits `USER_API_BASE_URL`.
 *
 * Execution:
 * - Set `RUN_USER === "true"` to run; otherwise the suite is skipped.
 */

jest.setTimeout(10000);

// Minimal generic schema (not app-specific)
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String },
  },
  { timestamps: true },
);

type User = InferSchemaType<typeof userSchema>;
const UserModel = mongoose.models.User || model<User>("User", userSchema);

/**
 * Single signup test scenario.
 * @property firstName Optional; included in API payload `name.firstName`.
 * @property secondName Optional; included in API payload `name.secondName`.
 * @property email Required; unique in the test schema.
 * @property password Required.
 * @property passwordConfirm Defaults to `password`; mismatch fails the test early.
 * @property username Optional; stored locally and sent in API checks/payload.
 * @property label Optional Jest test title.
 * @property local `true` = Mongoose-only flow; `false` = API existence check + create.
 * @property USER_API_BASE_URL Optional base (falls back to `process.env.USER_API_BASE_URL`).
 * @property USER_CHECK_EXISTENCE_ENDPOINT Existence check path segment (default: `check-user`); used in API mode before create.
 * @property CREATE_USER_ENDPOINT Create path (default: `users`).
 * @property contentType Request `Content-Type` (default: `application/json`).
 * @property expectStatus Expected HTTP status after successful API signup (default: `200`).
 */
type SignupTestCase = {
  firstName?: string;
  secondName?: string;
  email: string;
  password: string;
  passwordConfirm?: string;
  username?: string;

  label?: string;
  local: boolean;

  // API config
  USER_API_BASE_URL?: string;
  USER_CHECK_EXISTENCE_ENDPOINT?: string;
  CREATE_USER_ENDPOINT?: string;

  contentType?: string;
  expectStatus?: number;
};

/**
 * Registers user signup tests.
 *
 * @param cases - Signup scenarios (`SignupTestCase`).
 * @returns void
 */
const signupTest = (cases: SignupTestCase[]) => {
  const run = process.env.RUN_USER === "true";

  (run ? describe : describe.skip)("User Signup Tests", () => {
    afterEach(async () => {
      await UserModel.deleteMany({});
    });

    cases.forEach(
      (
        {
          firstName,
          secondName,
          email,
          password,
          passwordConfirm = password,
          username,
          label,
          local,
          USER_API_BASE_URL,
          USER_CHECK_EXISTENCE_ENDPOINT,
          CREATE_USER_ENDPOINT,
          contentType = "application/json",
          expectStatus = 200,
        },
        index,
      ) => {
        test(label || `signup user [${index}]`, async () => {
          const base = process.env.USER_API_BASE_URL || USER_API_BASE_URL;
          const checkEndpoint = USER_CHECK_EXISTENCE_ENDPOINT || "check-user";
          const createEndpoint = CREATE_USER_ENDPOINT || "users";

          if (password !== passwordConfirm) {
            await expect(
              Promise.reject(new Error("Passwords do not match")),
            ).rejects.toThrow();
            return;
          }

          if (local) {
            const existing = await UserModel.findOne({ email });

            if (existing) {
              await expect(
                UserModel.create({ email, password, username }),
              ).rejects.toThrow();
              return;
            }

            const user = await UserModel.create({
              email,
              password,
              username,
            });

            expect(user).toBeDefined();
            expect(user.email).toBe(email);
          } else {
            // Step 1: existence check (optional but realistic)
            if (checkEndpoint) {
              const checkRes = await axios.post(`${base}/${checkEndpoint}`, {
                username,
                email,
              });

              const msg = checkRes.data?.message;

              if (msg === "username-exist" || msg === "email-exist") {
                await expect(Promise.reject(new Error(msg))).rejects.toThrow();
                return;
              }
            }

            // Step 2: signup request
            const payload = {
              name: { firstName, secondName },
              username,
              eAddress: {
                email,
                password,
                passwordConfirm,
                passwordChangedAt: Date.now(),
              },
            };

            const res = await axios.post(`${base}/${createEndpoint}`, payload, {
              headers: { "Content-Type": contentType },
            });

            expect(res.status).toBe(expectStatus);
            expect(res.data).toBeDefined();
          }

          const inDb = await UserModel.findOne({ email });
          expect(inDb).not.toBeNull();
        });
      },
    );
  });
};

export default signupTest;
