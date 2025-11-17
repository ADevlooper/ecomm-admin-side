import express from "express";
import { upload } from "../middlewares/upload.js";

import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/new", (req, res) => res.render("new"));

// IMPORTANT: match front-end field name!
router.post("/create", upload.single("image"), createProduct);

router.get("/edit/:id", getProductById);

// IMPORTANT: match front-end field name!
router.post("/update/:id", upload.single("image"), updateProduct);

router.post("/delete/:id", deleteProduct);

export default router;
