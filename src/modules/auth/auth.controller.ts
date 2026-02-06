import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { StatusCodes } from "http-status-codes";

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const { user, token } = await authService.register(email, password);

      res.status(StatusCodes.CREATED).json({
        success: true,
        token,
        user: { id: user._id, email: user.email, isPro: user.isPro },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);

      res.status(StatusCodes.OK).json({
        success: true,
        token,
        user: { id: user._id, email: user.email, isPro: user.isPro },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
