import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "./user.model";
import { AppError } from "../../common/errors/AppError"; // Ensure you have your barrel export
import { StatusCodes } from "http-status-codes";

export class AuthService {
  // 1. REGISTER USER
  async register(
    email: string,
    password: string,
  ): Promise<{ user: IUser; token: string }> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already in use", StatusCodes.CONFLICT);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      passwordHash,
      isPro: false,
      isAdmin: false,
    });

    const token = this.generateToken(newUser);
    return { user: newUser, token };
  }

  // 2. LOGIN USER
  async login(
    email: string,
    password: string,
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  // Helper: Generate JWT
  private generateToken(user: IUser): string {
    return jwt.sign(
      { id: user._id, isPro: user.isPro },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );
  }
}

export const authService = new AuthService();
