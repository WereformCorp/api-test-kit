// tests/user.db.test.ts

import mongoose from "mongoose";
import { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

type User = InferSchemaType<typeof userSchema>;

const UserModel = model<User>("User", userSchema);

describe("User DB Operations", () => {
  beforeAll(async (): Promise<void> => {
    await mongoose.connect(
      "mongodb://127.0.0.1:27017/test_db" /*process.env.TEST_DB_URI*/ as string,
    );
  });

  afterEach(async (): Promise<void> => {
    await UserModel.deleteMany({});
  });

  afterAll(async (): Promise<void> => {
    await mongoose.connection.close();
  });

  test("creates a user successfully", async (): Promise<void> => {
    const user = await UserModel.create({
      email: "test@example.com",
      password: "123456",
    });

    expect(user._id).toBeDefined();
    expect(user.email).toBe("test@example.com");

    const inDb = await UserModel.findOne({ email: "test@example.com" });
    expect(inDb).not.toBeNull();
  });

  test("rejects duplicate email", async (): Promise<void> => {
    await UserModel.create({
      email: "test@example.com",
      password: "123456",
    });

    await expect(
      UserModel.create({
        email: "test@example.com",
        password: "123456",
      }),
    ).rejects.toThrow();
  });

  test("updates user email", async (): Promise<void> => {
    const user = await UserModel.create({
      email: "old@example.com",
      password: "123456",
    });

    user.email = "new@example.com";
    await user.save();

    const updated = await UserModel.findById(user._id);
    expect(updated).not.toBeNull();
    expect(updated!.email).toBe("new@example.com");
  });

  test("deletes user", async (): Promise<void> => {
    const user = await UserModel.create({
      email: "delete@example.com",
      password: "123456",
    });

    await UserModel.deleteOne({ _id: user._id });

    const deleted = await UserModel.findById(user._id);
    expect(deleted).toBeNull();
  });

  test("finds users correctly", async (): Promise<void> => {
    await UserModel.create({ email: "a@test.com", password: "123" });
    await UserModel.create({ email: "b@test.com", password: "123" });

    const users = await UserModel.find({});
    expect(users).toHaveLength(2);
  });
});
