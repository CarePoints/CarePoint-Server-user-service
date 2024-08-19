import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {

  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  phonenumber?: string;
  isBlocked: boolean;
  isVerified: boolean;
  roles: string;
  otp?: number;
  createdAt?: Date;
  profilePic?: string | null;
}

const UserSchema = new Schema<UserDocument>({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phonenumber: { type: String },
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  roles: { type: String, default: "user" },
  otp: { type: Number },
  createdAt: { type: Date, default: Date.now },
  profilePic: { type: String, default: null }
});

export const User = mongoose.model<UserDocument>("User", UserSchema);
