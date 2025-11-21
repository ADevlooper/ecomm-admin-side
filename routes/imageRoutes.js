import express from "express";
import { upload } from "../middlewares/upload.js";

import {
  getAllImages,
  createImageForProduct,
  getImageById,
  deleteImage,
} from "../controllers/imagesController.js";

const router = express.Router();

router.get("/", getAllImages);

// Upload image for a product
router.post("/", upload.single("image"), createImageForProduct);

// Fetch single image record
router.get("/:id", getImageById);

// Delete image record
router.delete("/:id", deleteImage);

export default router;
