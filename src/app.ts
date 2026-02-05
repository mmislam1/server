import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { imageSearchRouter } from "./modules/image-search/image-search.routes";
import { AppError } from "./common/errors/AppError";
import { StatusCodes } from "http-status-codes";

const app = express();

// 1. Security & Utility Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Cross-Origin support
app.use(morgan("dev")); // Logger
app.use(express.json());

// 2. Feature Routes
// We prefix this module to keep the API versioned
app.use("/api/v1/image-search", imageSearchRouter);

// 3. 404 Handler
app.use((req, res, next) => {
  next(
    new AppError(`Route ${req.originalUrl} not found`, StatusCodes.NOT_FOUND),
  );
});

// 4. Global Error Handler (Must be last)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[Error] ${message}`);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

export default app;
