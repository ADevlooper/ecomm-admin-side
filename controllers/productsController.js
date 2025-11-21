import { db } from "../db/client.js";
import { products, product_images, product_categories } from "../db/schema.js";
import { eq } from "drizzle-orm";

/* -------------------------------------
   CREATE PRODUCT
------------------------------------- */
export const createProduct = async (req, res) => {
  try {
    const { sku, name, description, price, in_stock } = req.body;
    // categories may be single id or array (from checkboxes named categories[])
    let { categories } = req.body;

    // normalize in_stock (checkbox sends 'on' when checked)
    const inStockBool = in_stock === "on" || in_stock === "true" || in_stock === "1";

    // Create product
    const newProduct = await db
      .insert(products)
      .values({
        sku: sku || null,
        name,
        description,
        price,
        in_stock: inStockBool,
      })
      .returning();

    const productId = newProduct[0].id;

    // associate categories (if provided)
    if (categories) {
      if (!Array.isArray(categories)) categories = [categories];
      for (const catId of categories) {
        await db.insert(product_categories).values({
          product_id: productId,
          category_id: Number(catId),
        });
      }
    }

    // Upload images (if present) - support multiple files in req.files
    if (req.files && req.files.length) {
      // insert each uploaded file as a separate product_images row
      for (let i = 0; i < req.files.length; i++) {
        const f = req.files[i];
        const filePath = `/uploads/${f.filename}`;

        await db.insert(product_images).values({
          product_id: productId,
          url: filePath,
          filename: f.filename,
          is_primary: i === 0, // first uploaded image becomes primary
          sort_order: i,
        });
      }
    }

    res.redirect("/");
  } catch (error) {
    console.log("Error creating product:", error);
    res.status(500).send("Error creating product");
  }
};

/* -------------------------------------
   UPDATE PRODUCT
------------------------------------- */
export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { sku, name, description, price, in_stock } = req.body;
    let { categories } = req.body;

    const inStockBool = in_stock === "on" || in_stock === "true" || in_stock === "1";

    // Update product fields
    await db
      .update(products)
      .set({
        sku: sku || null,
        name,
        description,
        price,
        in_stock: inStockBool,
      })
      .where(eq(products.id, id));

    // Image upload (support multiple files in req.files)
    if (req.files && req.files.length) {
      // Make older images non-primary first
      await db
        .update(product_images)
        .set({ is_primary: false })
        .where(eq(product_images.product_id, id));

      // Insert each uploaded file (first becomes primary)
      for (let i = 0; i < req.files.length; i++) {
        const f = req.files[i];
        const filePath = `/uploads/${f.filename}`;

        await db.insert(product_images).values({
          product_id: id,
          url: filePath,
          filename: f.filename,
          is_primary: i === 0,
          sort_order: i,
        });
      }
    }

    // Update categories: remove old associations then insert new ones
    if (categories) {
      // normalize
      if (!Array.isArray(categories)) categories = [categories];

      await db.delete(product_categories).where(eq(product_categories.product_id, id));

      for (const catId of categories) {
        await db.insert(product_categories).values({
          product_id: id,
          category_id: Number(catId),
        });
      }
    }

    res.redirect("/");
  } catch (error) {
    console.log("Error updating product:", error);
    res.status(500).send("Error updating product");
  }
};
