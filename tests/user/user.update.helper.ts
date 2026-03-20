import mongoose, { Schema, model, InferSchemaType } from "mongoose";

/**
 * User Update Test Helper
 *
 * Registers Jest tests that validate updating an existing `User` document
 * (save + read-back) using a test-only Mongoose model.
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
 * User update test case definition.
 * @property oldEmail Existing email used to seed the document.
 * @property newEmail New email to persist.
 * @property password Password used when creating the seed document.
 * @property label Optional test label shown in Jest output.
 */
type UserTestCase = {
  oldEmail: string;
  newEmail: string;
  password: string;
  label?: string;
};

// ---- REGISTER FUNCTION ----
/**
 * Registers user update tests.
 *
 * @param UserTestCases - List of user update cases to run.
 * @returns void
 */
const updateUserTest = (UserTestCases: UserTestCase[]) => {
  const run = process.env.RUN_USER === "true";

  (run ? describe : describe.skip)("User Update Tests", () => {
    afterEach(async () => {
      await UserModel.deleteMany({});
    });

    UserTestCases.forEach(({ oldEmail, newEmail, password, label }) => {
      test(label || "updates user email", async (): Promise<void> => {
        const user = await UserModel.create({
          email: oldEmail,
          password,
        });

        user.email = newEmail;
        await user.save();

        const updated = await UserModel.findById(user._id);
        expect(updated).not.toBeNull();
        expect(updated!.email).toBe(newEmail);
      });
    });
  });
};

export default updateUserTest;
