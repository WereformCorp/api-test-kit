import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
}

const UserSchema: Schema<IUser> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, // IMPORTANT for dupicate test
  },
  password: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IUser>("User", UserSchema);
