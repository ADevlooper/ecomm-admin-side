// routes/productsRoutes.js

import express from "express";
import { upload } from "../middlewares/upload.js";

import {
  getAllProducts,
  getNewProductPage,
  getEditProductPage,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productsController.js";

const router = express.Router();

// ------------------------
// LIST ALL PRODUCTS
// ------------------------
router.get("/", getAllProducts);

// ------------------------
// SHOW "ADD PRODUCT" PAGE
// ------------------------
router.get("/new", getNewProductPage);

// ------------------------
// CREATE PRODUCT
// FORM ACTION="/products/create"
// ------------------------
router.post("/create", upload.single("image"), createProduct);

// ------------------------
// SHOW EDIT PAGE
// FORM ACTION="/products/edit/:id"
// ------------------------
router.get("/edit/:id", getEditProductPage);

// ------------------------
// UPDATE PRODUCT
// POST "/products/edit/:id"
// ------------------------
router.post("/edit/:id", upload.single("image"), updateProduct);

// ------------------------
// DELETE PRODUCT
// POST "/products/delete/:id"
// ------------------------
router.post("/delete/:id", deleteProduct);

export default router;
