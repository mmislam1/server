import { Router } from "express";
import { imageSearchController } from "./image-search.controller";
import { uploadMiddleware } from "../../common/middlewares/upload.middleware";

const router = Router();

// POST /api/v1/image-search/detect
router.post(
  "/detect",
  uploadMiddleware.single("image"), // Apply specific middleware here
  imageSearchController.findMatches,
);

export const imageSearchRouter = router;
