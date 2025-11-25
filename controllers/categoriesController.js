// controllers/categoriesController.js
import { db } from "../db/client.js";
import { categories } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Only serve the six predefined categories. If any are missing, create them.
const PREDEFINED = ["Electronics", "Furniture", "Groceries", "Appliances", "Fashion", "Others"];

async function ensurePredefinedCategories() {
  const results = [];
  for (const name of PREDEFINED) {
    const rows = await db.select().from(categories).where(eq(categories.name, name)).catch(() => []);
    if (rows && rows.length) {
      results.push(rows[0]);
    } else {
      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
      try {
        const inserted = await db.insert(categories).values({ name, slug }).returning();
        if (inserted && inserted.length) results.push(inserted[0]);
      } catch (err) {
        // in rare race conditions, try to read it again
        const retry = await db.select().from(categories).where(eq(categories.name, name)).catch(() => []);
        if (retry && retry.length) results.push(retry[0]);
      }
    }
  }
  return results;
}

async function getAllCategories(req, res) {
  try {
    const rows = await ensurePredefinedCategories();
    return res.render("categories", { categories: rows, error: null });
  } catch (error) {
    console.error(error);
    return res.status(500).render("categories", { categories: [], error: "Failed to load categories" });
  }
}

export { getAllCategories };
