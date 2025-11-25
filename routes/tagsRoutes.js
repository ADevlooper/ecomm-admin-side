import express from "express";
import {
  createTag,
  getTagByName,
  attachTagToProduct,
  removeTagFromProduct,
  getTagsForProduct,
} from "../controllers/tagsController.js";

const router = express.Router();

// Create tag (body: { name })
router.post("/create", async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await createTag(name);
    res.json(tag);
  } catch (err) {
    console.error("/tags/create error:", err);
    res.status(400).json({ error: err.message || "Failed to create tag" });
  }
});

// Attach tag to product (body: { productId, tagId })
router.post("/attach", async (req, res) => {
  try {
    const { productId, tagId } = req.body;
    const rel = await attachTagToProduct(productId, tagId);
    res.json(rel);
  } catch (err) {
    console.error("/tags/attach error:", err);
    res.status(400).json({ error: err.message || "Failed to attach tag" });
  }
});

// Remove tag from product (body: { productId, tagId })
router.post("/remove", async (req, res) => {
  try {
    const { productId, tagId } = req.body;
    await removeTagFromProduct(productId, tagId);
    res.json({ success: true });
  } catch (err) {
    console.error("/tags/remove error:", err);
    res.status(400).json({ error: err.message || "Failed to remove tag" });
  }
});

// Get tags for product
router.get("/product/:id", async (req, res) => {
  try {
    const rows = await getTagsForProduct(req.params.id);
    res.json(rows);
  } catch (err) {
    console.error("/tags/product/:id error:", err);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

export default router;
