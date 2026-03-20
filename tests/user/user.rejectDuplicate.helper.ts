// ===================== USER DUPLICATE (AXIOS SUPPORT) =====================

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

const rejectUserDuplicateTest = (cases: UserTestCase[]) => {
  const run = process.env.RUN_USER === "true";

  (run ? describe : describe.skip)("User Reject Duplicate Test", () => {
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
        test(label || `reject duplicate [${index}]`, async () => {
          let user;

          const base = process.env.API_BASE_URL || API_BASE_URL;
          const endpoint = USER_API_ENDPOINT || "users";

          if (local) {
            user = await UserModel.create({ email, password });
          } else {
            user = await axios.post(
              `${base}/${endpoint}`,
              { email, password },
              { headers: { "Content-Type": contentType } },
            );
          }

          await expect(
            local
              ? UserModel.create({ email, password })
              : axios.post(
                  `${base}/${endpoint}`,
                  { email, password },
                  { headers: { "Content-Type": contentType } },
                ),
          ).rejects.toThrow();
        });
      },
    );
  });
};

export default rejectUserDuplicateTest;
