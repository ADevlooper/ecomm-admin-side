import { db } from "../db/client.js";
import { products, images, product_images } from "../db/schema.js";
import { asc, eq } from "drizzle-orm";

/* -------------------------
   GET ALL PRODUCTS (with primary image)
------------------------- */
export const getAllProducts = async (req, res) => {
  try {
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        in_stock: products.in_stock,
        primary_image: images.url, // may be null
      })
      .from(products)
      .leftJoin(
        product_images,
        eq(products.id, product_images.product_id)
      )
      .leftJoin(
        images,
        eq(product_images.image_id, images.id)
      )
      .orderBy(asc(products.id));

    return res.render("index", { products: rows });
  } catch (err) {
    console.error("getAllProducts ERROR:", err);
    return res.status(500).send("Internal Server Error");
  }
};

/* -------------------------
   NEW PRODUCT PAGE
------------------------- */
export const getNewProductPage = (req, res) => {
  try {
    return res.render("new");
  } catch (err) {
    return res.status(500).send("Server error");
  }
};

/* -------------------------
   EDIT PRODUCT PAGE
------------------------- */
export const getEditProductPage = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, Number(id)));

    if (!product.length) return res.status(404).send("Product not found");

    const imgs = await db
      .select()
      .from(images)
      .leftJoin(product_images, eq(images.id, product_images.image_id))
      .where(eq(product_images.product_id, Number(id)));

    return res.render("edit", { product: product[0], images: imgs });
  } catch (err) {
    console.error("getEditProductPage ERROR:", err);
    return res.status(500).send("Server error");
  }
};

/* -------------------------
   CREATE PRODUCT (supports multiple images)
------------------------- */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    // create product
    const newProduct = await db
      .insert(products)
      .values({
        name,
        description,
        price: price ? Number(price) : 0,
      })
      .returning();

    const productId = newProduct[0].id;

    // If images were uploaded
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        const img = await db
          .insert(images)
          .values({
            url: `/uploads/${file.filename}`,
            filename: file.filename,
          })
          .returning();

        await db.insert(product_images).values({
          product_id: productId,
          image_id: img[0].id,
          is_primary: i === 0, // first image = primary
          sort_order: i,
        });
      }
    }

    return res.redirect("/");
  } catch (err) {
    console.error("createProduct ERROR:", err);
    return res.status(500).send("Server error");
  }
};

/* -------------------------
   UPDATE PRODUCT
------------------------- */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    await db
      .update(products)
      .set({
        name,
        description,
        price: price ? Number(price) : 0,
      })
      .where(eq(products.id, Number(id)));

    // If new images uploaded
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        const img = await db
          .insert(images)
          .values({
            url: `/uploads/${file.filename}`,
            filename: file.filename,
          })
          .returning();

        await db.insert(product_images).values({
          product_id: Number(id),
          image_id: img[0].id,
          is_primary: false,
          sort_order: i,
        });
      }
    }

    return res.redirect("/");
  } catch (err) {
    console.error("updateProduct ERROR:", err);
    return res.status(500).send("Server error");
  }
};

/* -------------------------
   DELETE PRODUCT (+ images)
------------------------- */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // remove relationships
    await db.delete(product_images).where(eq(product_images.product_id, Number(id)));

    // remove product
    await db.delete(products).where(eq(products.id, Number(id)));

    return res.redirect("/");
  } catch (err) {
    console.error("deleteProduct ERROR:", err);
    return res.status(500).send("Server error");
  }
};
