import { Router } from "express";
import { paymentController } from "./payment.controller";
import { authMiddleware } from "../../common/middlewares/auth.middleware";

const router = Router();

// Routes must be protected because we need the User ID to upgrade them
router.post("/create-order", authMiddleware, paymentController.createOrder);
router.post("/capture-order", authMiddleware, paymentController.captureOrder);

export const paymentRouter = router;
