import { Request, Response, NextFunction } from "express";
import { imageSearchService } from "./image-search.service";
import { AppError } from "../../common/errors/AppError";
import { StatusCodes } from "http-status-codes";

export class ImageSearchController {
  // Using arrow function to preserve 'this' context
  findMatches = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError("Image file is required", StatusCodes.BAD_REQUEST);
      }

      const results = await imageSearchService.detectExactMatches(
        req.file.buffer,
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error); // Pass to global error handler
    }
  };
}

export const imageSearchController = new ImageSearchController();
