import mongoose, { Schema, model, InferSchemaType } from "mongoose";

/**
 * User Delete Test Helper
 *
 * Registers Jest tests that validate deleting a `User` document
 * and confirming it no longer exists in the database.
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
 * User delete test case definition.
 * @property email Email used to seed the document.
 * @property password Password used when creating the seed document.
 * @property label Optional test label shown in Jest output.
 */
type UserTestCase = {
  email: string;
  password: string;
  label?: string;
};

// ---- REGISTER FUNCTION ----
/**
 * Registers user delete tests.
 *
 * @param UserTestCases - List of delete cases to run.
 * @returns void
 */
const deleteUserTest = (UserTestCases: UserTestCase[]) => {
  const run = process.env.RUN_USER === "true";

  (run ? describe : describe.skip)("User Delete Tests", () => {
    afterEach(async () => {
      await UserModel.deleteMany({});
    });

    UserTestCases.forEach(({ email, password, label }) => {
      test(label || "deletes user", async (): Promise<void> => {
        const user = await UserModel.create({
          email,
          password,
        });

        await UserModel.deleteOne({ _id: user._id });

        const deleted = await UserModel.findById(user._id);
        expect(deleted).toBeNull();
      });
    });
  });
};

export default deleteUserTest;
