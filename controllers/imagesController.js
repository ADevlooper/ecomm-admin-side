
// controllers/imagesController.js
import { db } from "../db/db.js";
import { images } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Get all images
export async function getAllImages(req, res) {
  try {
    const rows = await db.select().from(images);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to retrieve images" });
  }
}

// Upload/create image
export async function createImage(req, res) {
  try {
    const file = req.file;

    if (!file)
      return res.status(400).json({ error: "Image file is required" });

    const { alt_text } = req.body;

    const result = await db
      .insert(images)
      .values({
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

    const result = await db.select().from(images).where(eq(images.id, id));

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

    await db.delete(images).where(eq(images.id, id));

    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
}
