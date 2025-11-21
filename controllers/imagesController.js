// controllers/productImagesController.js
import { db } from "../db/db.js";
import { product_images } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Get all product images
export async function getAllProductImages(req, res) {
  try {
    const rows = await db.select().from(product_images);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching product images:", error);
    res.status(500).json({ error: "Failed to retrieve product images" });
  }
}

// Upload/create product image
export async function createProductImage(req, res) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const { product_id, alt_text, is_primary, sort_order } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "product_id is required" });
    }

    const result = await db
      .insert(product_images)
      .values({
        product_id: Number(product_id),
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        alt_text: alt_text || null,
        is_primary: is_primary === "true",
        sort_order: sort_order ? Number(sort_order) : 0,
      })
      .returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error uploading product image:", error);
    res.status(500).json({ error: "Failed to upload product image" });
  }
}

// Get product image by ID
export async function getProductImageById(req, res) {
  try {
    const { id } = req.params;

    const result = await db
      .select()
      .from(product_images)
      .where(eq(product_images.id, Number(id)));

    if (result.length === 0) {
      return res.status(404).json({ error: "Product image not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error retrieving product image:", error);
    res.status(500).json({ error: "Failed to retrieve product image" });
  }
}

// Delete product image
export async function deleteProductImage(req, res) {
  try {
    const { id } = req.params;

    await db
      .delete(product_images)
      .where(eq(product_images.id, Number(id)));

    res.json({ success: true, message: "Product image deleted" });
  } catch (error) {
    console.error("Error deleting product image:", error);
    res.status(500).json({ error: "Failed to delete product image" });
  }
}
