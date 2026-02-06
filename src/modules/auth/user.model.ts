import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  isPro: boolean; 
  proExpiresAt?: Date; 
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    isPro: { type: Boolean, default: false },
    proExpiresAt: { type: Date },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", UserSchema);
