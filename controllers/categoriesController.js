// controllers/categoriesController.js
import { db } from "../db/client.js";
import { categories } from "../db/schema.js";
import { eq } from "drizzle-orm";

// GET all categories
export const getAllCategories = async (req, res) => {
  try {
    const rows = await db.select().from(categories);
    res.render("categories", { categories: rows });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to load categories");
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    await db.insert(categories).values({
      name,
      slug,
      description,
    });

    res.redirect("/categories");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to create category");
  }
};

// Get category by id
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const row = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (row.length === 0)
      return res.status(404).send("Category not found");

    res.render("editCategory", { category: row[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch category");
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    await db
      .update(categories)
      .set({ name, slug, description })
      .where(eq(categories.id, id));

    res.redirect("/categories");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to update category");
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await db.delete(categories).where(eq(categories.id, id));

    res.redirect("/categories");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete category");
  }
};
