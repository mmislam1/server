import { Request, Response, NextFunction } from "express";
import { imageSearchService } from "./image-search.service";
import { AppError } from "../../common/errors/AppError";
import { StatusCodes } from "http-status-codes";

export class ImageSearchController {
  findMatches = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file)
        throw new AppError("Image required", StatusCodes.BAD_REQUEST);

      // We get isPro from the auth middleware
      const isPro = req.user?.isPro || false;

      const results = await imageSearchService.detectExactMatches(
        req.file.buffer,
        isPro,
      );

      res.status(StatusCodes.OK).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  };
}
export const imageSearchController = new ImageSearchController();
