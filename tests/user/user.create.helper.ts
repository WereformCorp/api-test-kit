import mongoose, { Schema, model, InferSchemaType } from "mongoose";

/**
 * User Create Test Helper
 *
 * Registers a Jest suite that validates the “create” behavior for a test-only
 * Mongoose `User` model.
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
 */
type UserTestCase = {
  email: string;
  password: string;
  label?: string;
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

    cases.forEach(({ email, password, label }, index) => {
      test(label || `Create user [${index}]`, async () => {
        const user = await UserModel.create({ email, password });

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
    });
  });
};

export default registerUserCreateTest;
