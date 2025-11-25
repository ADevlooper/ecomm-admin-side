import { db } from "../db/client.js";
import { products, product_images, product_categories, categories } from "../db/schema.js";
import { eq } from "drizzle-orm";

/* -------------------------------------
   CREATE PRODUCT
------------------------------------- */
export const createProduct = async (req, res) => {
  try {
    const { sku, name, description, price, in_stock, category } = req.body;
    // log the simple category input (temporary storage)
    if (typeof category !== 'undefined') console.log(`Product category (form): ${category}`);
    // simple validation
    if (!name || typeof name !== 'string' || name.trim() === '' || !price) {
      const cats = await db.select().from(categories).catch(() => []);
      return res.status(400).render("new", { categories: cats, error: "Product name and price are required" });
    }

    // normalize in_stock: checkbox now represents "Out of Stock".
    // If checkbox is checked (in_stock present), that means OUT OF STOCK -> in_stock = false.
    const outOfStockChecked = in_stock === "on" || in_stock === "true" || in_stock === "1";
    const inStockBool = !outOfStockChecked;

    // Create product
    let newProduct;
    try {
      newProduct = await db
        .insert(products)
        .values({
          sku: sku || null,
          name,
          description,
          price,
          in_stock: inStockBool,
        })
        .returning();
    } catch (err) {
      console.error("DB error creating product:", err);
      const cats = await db.select().from(categories).catch(() => []);
      return res.status(500).render("new", { categories: cats, error: "Failed to create product" });
    }

    const productId = newProduct[0].id;

    // Map selected dropdown category to DB category (only one allowed)
    const selectedCategory = (req.body && req.body.category) ? String(req.body.category).trim() : null;
    const allowed = ["Electronics","Furniture","Groceries","Appliances","Fashion","Others"];
    let selectedCategoryId = null;
    if (selectedCategory) {
      if (!allowed.includes(selectedCategory)) {
        const cats = await db.select().from(categories).catch(() => []);
        return res.status(400).render("new", { categories: cats, error: "Invalid category selected" });
      }
      // find-or-create category by exact name
      try {
        const existing = await db.select().from(categories).where(eq(categories.name, selectedCategory));
        if (existing && existing.length) {
          selectedCategoryId = existing[0].id;
        } else {
          const slug = selectedCategory.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
          const inserted = await db.insert(categories).values({ name: selectedCategory, slug }).returning();
          if (inserted && inserted.length) selectedCategoryId = inserted[0].id;
        }
      } catch (err) {
        console.error("Error resolving selected category:", err);
      }
    }

    // associate selected dropdown category
    if (selectedCategoryId) {
      try {
        await db.insert(product_categories).values({ product_id: productId, category_id: Number(selectedCategoryId) });
      } catch (err) {
        console.error("Error associating selected category:", err);
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
    const cats = await db.select().from(categories).catch(() => []);
    return res.status(500).render("new", { categories: cats, error: "Unexpected error creating product" });
  }
};

/* -------------------------------------
   UPDATE PRODUCT
------------------------------------- */
export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { sku, name, description, price, in_stock, category } = req.body;
    // log the simple category input on update
    if (typeof category !== 'undefined') console.log(`Updated product category (form) for id ${id}: ${category}`);
    // no checkbox categories: we expect a single dropdown `category` value

    // checkbox represents "Out of Stock"; if checked => product is out of stock
    const outOfStockChecked = in_stock === "on" || in_stock === "true" || in_stock === "1";
    const inStockBool = !outOfStockChecked;

    // Update product fields
    try {
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
    } catch (err) {
      console.error("DB error updating product:", err);
      // fetch product/images to re-render edit with error
      const product = await db.select().from(products).where(eq(products.id, id)).catch(() => []);
      const images = await db.select().from(product_images).where(eq(product_images.product_id, id)).catch(() => []);
      return res.status(500).render("edit", { product: product[0] || null, images, categories: [], selectedCategoryIds: [], error: "Failed to update product" });
    }

    // Image upload (support multiple files in req.files)
    if (req.files && req.files.length) {
      try {
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
      } catch (err) {
        console.error("Error handling uploaded images:", err);
        const product = await db.select().from(products).where(eq(products.id, id)).catch(() => []);
        const images = await db.select().from(product_images).where(eq(product_images.product_id, id)).catch(() => []);
        return res.status(500).render("edit", { product: product[0] || null, images, categories: [], selectedCategoryIds: [], error: "Failed to process uploaded images" });
      }
    }

    // Map selected dropdown category to DB category (single value)
    const selectedCategory = (req.body && req.body.category) ? String(req.body.category).trim() : null;
    const allowed = ["Electronics","Furniture","Groceries","Appliances","Fashion","Others"];
    let selectedCategoryId = null;
    if (selectedCategory) {
      if (!allowed.includes(selectedCategory)) {
        const product = await db.select().from(products).where(eq(products.id, id)).catch(() => []);
        const images = await db.select().from(product_images).where(eq(product_images.product_id, id)).catch(() => []);
        return res.status(400).render("edit", { product: product[0] || null, images, categories: [], selectedCategoryIds: [], error: "Invalid category selected" });
      }
      try {
        const existing = await db.select().from(categories).where(eq(categories.name, selectedCategory));
        if (existing && existing.length) selectedCategoryId = existing[0].id;
        else {
          const slug = selectedCategory.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
          const inserted = await db.insert(categories).values({ name: selectedCategory, slug }).returning();
          if (inserted && inserted.length) selectedCategoryId = inserted[0].id;
        }
      } catch (err) {
        console.error("Error resolving selected category on update:", err);
      }
    }

    if (selectedCategoryId) {
      try {
        // remove old associations and link the single selected category
        await db.delete(product_categories).where(eq(product_categories.product_id, id));
        await db.insert(product_categories).values({ product_id: id, category_id: Number(selectedCategoryId) });
      } catch (err) {
        console.error("Error associating selected category on update:", err);
        const product = await db.select().from(products).where(eq(products.id, id)).catch(() => []);
        const images = await db.select().from(product_images).where(eq(product_images.product_id, id)).catch(() => []);
        return res.status(500).render("edit", { product: product[0] || null, images, categories: [], selectedCategoryIds: [], error: "Failed to update category" });
      }
    }

    res.redirect("/");
  } catch (error) {
    console.log("Error updating product:", error);
    const product = await db.select().from(products).where(eq(products.id, req.params.id)).catch(() => []);
    const images = await db.select().from(product_images).where(eq(product_images.product_id, req.params.id)).catch(() => []);
    return res.status(500).render("edit", { product: product[0] || null, images, categories: [], selectedCategoryIds: [], error: "Unexpected error updating product" });
  }
};
