// ===================== USER UPDATE (AXIOS SUPPORT) =====================

import mongoose, { Schema, model, InferSchemaType } from "mongoose";
import axios from "axios";

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
