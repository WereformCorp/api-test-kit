// ===================== USER DELETE (AXIOS SUPPORT) =====================

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
  email: string;
  password: string;
  label?: string;
  local: boolean;
  API_BASE_URL?: string;
  USER_API_ENDPOINT?: string;
  contentType?: string;
};

const deleteUserTest = (cases: UserTestCase[]) => {
  const run = process.env.RUN_USER === "true";

  (run ? describe : describe.skip)("User Delete Tests", () => {
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
        test(label || `delete user [${index}]`, async () => {
          const base = process.env.API_BASE_URL || API_BASE_URL;
          const endpoint = USER_API_ENDPOINT || "users";

          if (local) {
            const user = await UserModel.create({ email, password });
            await UserModel.deleteOne({ _id: user._id });

            const deleted = await UserModel.findById(user._id);
            expect(deleted).toBeNull();
          } else {
            const res = await axios.post(
              `${base}/${endpoint}`,
              { email, password },
              { headers: { "Content-Type": contentType } },
            );

            await axios.delete(`${base}/${endpoint}/${res.data._id}`);

            const deleted = await UserModel.findOne({ email });
            expect(deleted).toBeNull();
          }
        });
      },
    );
  });
};

export default deleteUserTest;
