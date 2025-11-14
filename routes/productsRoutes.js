import express from "express";
import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/", getAllProducts);

router.get("/new", (req, res) => {
  console.log("➡️ /new route reached");
  res.render("new");
});

router.post("/create", createProduct);

router.get("/edit/:id", getProductById);

router.post("/update/:id", updateProduct);

router.post("/delete/:id", deleteProduct);

export default router;
