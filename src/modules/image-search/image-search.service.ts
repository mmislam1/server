import { visionClient } from "../../config/google-vision";
import { AppError } from "../../common/errors/AppError";
import { StatusCodes } from "http-status-codes";
import { VisionResult } from "./image-search.types";

export class ImageSearchService {
  // We accept 'isPro' as a second argument now
  async detectExactMatches(imageBuffer: Buffer, isPro: boolean): Promise<any> {
    try {
      const [result] = await visionClient.webDetection({
        image: { content: imageBuffer },
      });

      const webDetection = result.webDetection;
      if (!webDetection)
        throw new AppError("No results", StatusCodes.BAD_GATEWAY);

      const exactMatches = webDetection.fullMatchingImages || [];
      const pages = webDetection.pagesWithMatchingImages || [];

      // --- LOGIC GATING ---

      if (isPro) {
        // PRO USER: Gets everything
        return {
          userTier: "PRO",
          exactMatches: exactMatches.map((img) => ({
            url: img.url,
            score: img.score,
          })),
          pages: pages.map((page) => ({
            title: page.pageTitle,
            url: page.url,
          })),
        };
      } else {
        // GENERAL USER: Gets limited info (Teaser)
        return {
          userTier: "GENERAL",
          message: "Upgrade to PRO to see full URLs and source pages.",
          matchCount: exactMatches.length,
          // Only show the first match, and maybe mask part of the URL
          previewMatch: exactMatches.length > 0 ? exactMatches[0].url : null,
          pagesFound: pages.length, // Just the count, no links
        };
      }
    } catch (error: any) {
      throw new AppError(
        `Vision API Failed: ${error.message}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
export const imageSearchService = new ImageSearchService();
