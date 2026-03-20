import mongoose, { Schema, model, InferSchemaType } from "mongoose";

/**
 * User Duplicate-Rejection Test Helper
 *
 * Registers a Jest suite that validates the schema integrity rule for `email`
 * marked as `unique: true` in the test schema.
 *
 * Execution control:
 * - Set `RUN_USER === "true"` to enable these tests.
 * - Otherwise, the suite is skipped.
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
 * Duplicate email rejection test case definition.
 * @property email Email to seed, then attempt to insert again.
 * @property password Password to seed with.
 * @property label Optional test label shown in Jest output.
 */
type UserTestCase = {
  email: string;
  password: string;
  label?: string;
};

// ---- REGISTER FUNCTION ----
/**
 * Registers “reject duplicate email” tests.
 *
 * @param UserTestCases - List of duplicate email cases to run.
 * @returns void
 */
const rejectUserDuplicateTest = (UserTestCases: UserTestCase[]) => {
  const run = process.env.RUN_USER === "true";

  (run ? describe : describe.skip)("User Reject Duplicate Test", () => {
    afterEach(async () => {
      await UserModel.deleteMany({});
    });

    UserTestCases.forEach(({ email, password, label }) => {
      test(label || "rejects duplicate email", async (): Promise<void> => {
        await UserModel.create({
          email,
          password,
        });

        await expect(
          UserModel.create({
            email,
            password,
          }),
        ).rejects.toThrow();
      });
    });
  });
};

export default rejectUserDuplicateTest;
