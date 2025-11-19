// routes/imageRoutes.js
import express from "express";
import { upload } from "../middlewares/upload.js";
import {
  getAllImages,
  createImage,
  getImageById,
  deleteImage,
} from "../controllers/imagesController.js";

const router = express.Router();

router.get("/", getAllImages);
router.post("/", upload.single("image"), createImage);
router.get("/:id", getImageById);
router.delete("/:id", deleteImage);

export default router;
