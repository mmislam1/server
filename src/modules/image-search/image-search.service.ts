import { visionClient } from "../../config/google-vision";
import { AppError } from "../../common/errors/AppError";
import { StatusCodes } from "http-status-codes";
import { VisionResult } from "./image-search.types";

export class ImageSearchService {
  /**
   * Sends image buffer to Google Vision API for Web Detection
   */
  async detectExactMatches(imageBuffer: Buffer): Promise<VisionResult> {
    try {
      const [result] = await visionClient.webDetection({
        image: { content: imageBuffer },
      });

      const webDetection = result.webDetection;

      if (!webDetection) {
        throw new AppError(
          "No web detection results returned from Google",
          StatusCodes.BAD_GATEWAY,
        );
      }

      // Filter and map results
      const exactMatches = (webDetection.fullMatchingImages || []).map(
        (img) => ({
          url: img.url || "",
          score: img.score || 0,
        }),
      );

      const pages = (webDetection.pagesWithMatchingImages || []).map(
        (page) => ({
          title: page.pageTitle || "Unknown Title",
          url: page.url || "",
        }),
      );

      return { exactMatches, pages };
    } catch (error: any) {
      // Wrap external API errors in our custom AppError
      throw new AppError(
        `Google Vision API Failed: ${error.message}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const imageSearchService = new ImageSearchService();
