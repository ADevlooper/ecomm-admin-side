// routes/productImageRoutes.js
import express from "express";
import { upload } from "../middlewares/upload.js";

import {
  getAllProductImages,
  createProductImage,
  getProductImageById,
  deleteProductImage,
} from "../controllers/productImagesController.js";

const router = express.Router();

router.get("/", getAllProductImages);
router.post("/", upload.single("image"), createProductImage);
router.get("/:id", getProductImageById);
router.delete("/:id", deleteProductImage);

export default router;
