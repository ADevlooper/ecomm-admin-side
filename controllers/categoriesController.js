// controllers/categoriesController.js
import { db } from "../db/db.js";
import { categories } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Get all categories
export async function getAllCategories(req, res) {
  try {
    const rows = await db.select().from(categories);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to retrieve categories" });
  }
}

// Create new category
export async function createCategory(req, res) {
  try {
    const { name, slug, description } = req.body;

    const result = await db
      .insert(categories)
      .values({ name, slug, description })
      .returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
}

// Get category by ID
export async function getCategoryById(req, res) {
  try {
    const { id } = req.params;

    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (result.length === 0)
      return res.status(404).json({ error: "Category not found" });

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
}

// Update category
export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    const result = await db
      .update(categories)
      .set({ name, slug, description })
      .where(eq(categories.id, id))
      .returning();

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
}

// Delete category
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    await db.delete(categories).where(eq(categories.id, id));

    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
}
