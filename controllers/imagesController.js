// controllers/imagesController.js
import { db } from "../db/client.js";
import { product_images } from "../db/schema.js";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

// Get all images (for all products)
export async function getAllImages(req, res) {
  try {
    const rows = await db.select().from(product_images);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to retrieve images" });
  }
}

// Upload & create image for a product
export async function createImageForProduct(req, res) {
  try {
    const file = req.file;
    const { product_id, alt_text } = req.body;

    if (!product_id)
      return res.status(400).json({ error: "product_id is required" });

    if (!file)
      return res.status(400).json({ error: "Image file is required" });

    const result = await db
      .insert(product_images)
      .values({
        product_id: Number(product_id),
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        alt_text: alt_text || null,
      })
      .returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
}

// Get image by ID
export async function getImageById(req, res) {
  try {
    const { id } = req.params;

    const result = await db
      .select()
      .from(product_images)
      .where(eq(product_images.id, id));

    if (result.length === 0)
      return res.status(404).json({ error: "Image not found" });

    res.json(result[0]);
  } catch (error) {
    console.error("Error retrieving image:", error);
    res.status(500).json({ error: "Failed to retrieve image" });
  }
}

// Delete image
export async function deleteImage(req, res) {
  try {
    const { id } = req.params;

    const record = await db
      .select()
      .from(product_images)
      .where(eq(product_images.id, id));

    if (record.length === 0)
      return res.status(404).json({ error: "Image not found" });

    // delete file from uploads
    if (record[0].filename) {
      const filePath = path.join("uploads", record[0].filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.delete(product_images).where(eq(product_images.id, id));

    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
}
