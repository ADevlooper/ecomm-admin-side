import express from "express";
import { uploadSingle } from "../middlewares/upload.js";

import {
  getAllImages,
  createImageForProduct,
  getImageById,
  deleteImage,
} from "../controllers/imagesController.js";

const router = express.Router();

router.get("/", getAllImages);

// Upload image for a product
// Upload single image for a product (field name: 'image')
router.post("/products/create", uploadSingle, createImageForProduct);

// Fetch single image record
router.get("/:id", getImageById);

// Delete image record
router.delete("/:id", deleteImage);

export default router;
