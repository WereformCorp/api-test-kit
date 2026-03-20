import mongoose, { Schema, model, InferSchemaType } from "mongoose";
import axios from "axios";

/**
 * User Create Test Helper
 *
 * Registers a Jest suite that validates the “create” behavior for a test-only
 * Mongoose `User` model.
 *
 * Each test case can run in two modes:
 * - `local: true`  -> create directly with Mongoose.
 * - `local: false` -> create via API (axios POST) and then assert state via the same Mongoose model.
 *
 * Execution control:
 * - Set `RUN_USER === "true"` to enable these tests.
 * - Otherwise, the suite is skipped via `describe.skip`.
 */

jest.setTimeout(10000);

// Schema
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

type User = InferSchemaType<typeof userSchema>;
const UserModel = mongoose.models.User || model<User>("User", userSchema);

// ---- TYPES ----
/**
 * User creation test case definition.
 * @property email User email to insert.
 * @property password User password to insert.
 * @property label Optional test label shown in Jest output.
 * @property local Select execution mode for this case.
 *                  `true` = Mongoose create, `false` = API create via axios.
 * @property API_BASE_URL Optional base URL for API mode (defaults to `process.env.API_BASE_URL`).
 * @property USER_API_ENDPOINT Optional user creation endpoint (defaults to derived apiBaseUrl).
 * @property contentType Optional request Content-Type header (defaults to `application/json`).
 */
type UserTestCase = {
  email: string;
  password: string;
  label?: string;
  local: boolean; // true -> Mongoose create, false -> API axios POST
  API_BASE_URL?: string; // Optional API base URL for external API tests
  USER_API_ENDPOINT?: string; // Optional API endpoint for user creation (e.g., "users")
  contentType?: string; // Optional content type for API requests (default: "application/json")
};

// ---- REGISTER FUNCTION ----
/**
 * Registers user creation tests.
 *
 * @param cases - List of user creation test cases to run.
 * @returns void
 */
const registerUserCreateTest = (cases: UserTestCase[]) => {
  const run = process.env.RUN_USER === "true";

  (run ? describe : describe.skip)("User Creation Tests", () => {
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
        test(label || `Create user [${index}]`, async () => {
          let user;
          let apiBaseUrl = process.env.API_BASE_URL || API_BASE_URL;
          let userApiEndpoint = apiBaseUrl || USER_API_ENDPOINT;

          if (local) user = await UserModel.create({ email, password });
          else
            user = await axios.post(
              `${process.env.API_BASE_URL}/${userApiEndpoint}`,
              {
                email,
                password,
              },
              {
                headers: {
                  "Content-Type": contentType,
                },
              },
            );

          expect(user._id).toBeDefined();
          expect(user.email).toBe(email);

          console.table([
            {
              label: "CREATE_USER",
              email,
              exists: !!user,
            },
          ]);

          const inDb = await UserModel.findOne({ email });
          expect(inDb).not.toBeNull();
        });
      },
    );
  });
};

export default registerUserCreateTest;
