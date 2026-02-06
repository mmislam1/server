import { Request, Response, NextFunction } from "express";
import { paymentService } from "./payment.service";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/AppError";

export class PaymentController {
  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount } = req.body; // Optional: let frontend specify amount or hardcode in service
      const order = await paymentService.createOrder(amount);
      res.status(StatusCodes.OK).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  captureOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.body;
      const userId = req.user?.id; // Comes from Auth Middleware

      if (!orderId)
        throw new AppError("Order ID required", StatusCodes.BAD_REQUEST);
      if (!userId)
        throw new AppError("User not identified", StatusCodes.UNAUTHORIZED);

      const result = await paymentService.captureOrder(orderId, userId);

      res.status(StatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export const paymentController = new PaymentController();
