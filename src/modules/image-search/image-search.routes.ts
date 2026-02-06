import { Router } from "express";
import { imageSearchController } from "./image-search.controller";
import { uploadMiddleware } from "../../common/middlewares/upload.middleware";
import { authMiddleware } from "../../common/middlewares/auth.middleware";

const router = Router();

// Protect the route so we know who the user is
router.post(
  "/detect",
  authMiddleware,
  uploadMiddleware.single("image"),
  imageSearchController.findMatches,
);

export const imageSearchRouter = router;
