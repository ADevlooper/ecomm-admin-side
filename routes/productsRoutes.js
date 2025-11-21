import express from "express";
import { upload } from "../middlewares/upload.js";

import {
  createProduct,
  updateProduct,
} from "../controllers/productsController.js";

import { db } from "../db/client.js";
import { products, product_images, categories, product_categories } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

// Show all products (INDEX PAGE)
router.get("/", async (req, res) => {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      image_url: product_images.url,
    })
    .from(products)
    .leftJoin(
      product_images,
      eq(products.id, product_images.product_id)
    )
    .where(eq(product_images.is_primary, true));

  res.render("index", { products: rows });
});

// Show NEW form
router.get("/new", async (req, res) => {
  // fetch categories to allow assigning categories when creating a product
  const cats = await db.select().from(categories);
  res.render("new", { categories: cats });
});

// Create product (accept multiple images)
router.post("/create", upload.array("images", 10), createProduct);

// Show EDIT form
router.get("/edit/:id", async (req, res) => {
  const id = req.params.id;

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, id));

  const images = await db
    .select()
    .from(product_images)
    .where(eq(product_images.product_id, id));

  // fetch categories and the product's selected categories
  const cats = await db.select().from(categories);
  const selected = await db
    .select()
    .from(product_categories)
    .where(eq(product_categories.product_id, id));

  const selectedCategoryIds = selected.map((s) => s.category_id);

  res.render("edit", { product: product[0], images, categories: cats, selectedCategoryIds });
});

// Update product (accept multiple images)
router.post("/update/:id", upload.array("images", 10), updateProduct);

// Delete product
router.post("/delete/:id", async (req, res) => {
  await db.delete(products).where(eq(products.id, req.params.id));
  res.redirect("/");
});

export default router;
